import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import {
	CreateOfferDto,
	DeleteOfferResDto,
	OfferDataDto,
	OfferDataForMailDto,
	OfferDto,
	OfferForModeratorDto,
	OfferForModeratorRsDto,
	OffersResDto,
	OfferUpdateDto,
	OfferUpdateManyDto,
	OfferUpdateOneDto,
	QueryGetOffersDto,
	SetOfferStatusFromCustomerDto,
	SetOfferStatusFromModeratorDto,
} from '../../common/dto/offer';
import { AppErrors } from '../../common/errors';
import {
	Contest,
	ContestStatus,
	OfferStatus,
	Prisma,
	Role,
	User,
} from '@prisma/client';
import { AppMessages } from '../../common/messages';
import { IOfferDataMail } from '../../common/interfaces/offer';
import { OFFER_STATUS_COMMAND } from '../../common/enum';
import { OfferConstants } from '../../common/constants';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { IPagination } from '../../common/interfaces/pagination';

@Injectable()
export class OfferService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly fileService: FileService,
		private readonly userService: UserService,
		private readonly mailService: MailService,
	) {}

	public async getOffers(
		id: number,
		role: Role,
		query: QueryGetOffersDto,
		pagination: IPagination,
	): Promise<OffersResDto | OfferForModeratorRsDto> {
		const predicates: Prisma.OfferFindManyArgs = this.createOffersPredicates(
			id,
			role,
			+query.contestId,
		);
		let offersData: OfferDto[];
		const [offers, totalCount]: [
			offers: OfferDto[] | OfferForModeratorDto[],
			totalCount: number,
		] = await this.prismaService.$transaction([
			this.prismaService.offer.findMany({
				...predicates,
				...pagination,
			}),
			this.prismaService.offer.count({ where: predicates.where }),
		]);
		if (role !== Role.moderator) {
			offersData = offers.map(
				(offer: OfferDto): OfferDto => ({
					...offer,
					ratings: offer.ratings.length ? offer.ratings : [{ mark: 0 }],
				}),
			);
		}
		return {
			offers: role === Role.moderator ? offers : offersData,
			totalCount,
		};
	}

	public async findOneOffer(id: number, select: any): Promise<any> {
		try {
			return this.prismaService.offer.findFirst({
				where: { id },
				select,
			});
		} catch (e) {
			throw new InternalServerErrorException(
				AppErrors.THIS_FILE_DOES_NOT_EXIST,
				{
					cause: e,
				},
			);
		}
	}

	public async createOffer(
		userId: number,
		dto: CreateOfferDto,
	): Promise<OfferDataDto> {
		try {
			const { contest, ...offerData }: OfferDataForMailDto =
				await this.prismaService.offer.create({
					data: { userId, ...dto, contestId: +dto.contestId },
					select: {
						...OfferConstants.SELECT_FIELD_OFFER,
						user: {
							select: {
								firstName: true,
								lastName: true,
								displayName: true,
								email: true,
								avatar: true,
								rating: true,
							},
						},
						contest: {
							select: {
								title: true,
								user: { select: { firstName: true, lastName: true } },
							},
						},
					},
				});
			const emailModerator: Partial<User> =
				await this.prismaService.user.findFirst({
					where: { role: Role.moderator },
					select: { email: true },
				});
			await this.mailService.sendMail(
				emailModerator.email,
				AppMessages.MSG_EMAIL_CREATE_OFFER_FOR_MODERATOR,
				{
					text: offerData.text,
					originalFileName: offerData.originalFileName,
					title: contest.title,
					firstName: contest.user.firstName,
					lastName: contest.user.lastName,
				},
			);
			return offerData;
		} catch (e) {
			throw new InternalServerErrorException(
				AppErrors.INTERNAL_SERVER_ERROR_TRY_AGAIN_LATER,
				{
					cause: e,
				},
			);
		}
	}

	public async deleteOffer(
		id: number,
		role: Role,
		userId: number,
	): Promise<DeleteOfferResDto> {
		const predicateWhere:
			| { id: number; userId?: undefined }
			| { id: number; userId: number } =
			role === Role.moderator ? { id } : { id, userId };
		const offerData: IOfferDataMail = await this.prismaService.offer.findFirst({
			where: {
				...predicateWhere,
				NOT: { status: OfferStatus.won },
			},
			select: OfferConstants.SELECT_FIELD_DELETE_OFFER_DATA_MAIL_,
		});
		if (!offerData)
			throw new BadRequestException(
				AppErrors.OFFER_WITH_THIS_ID_DOES_NOT_EXISTS,
			);
		await this.prismaService.$transaction(async (): Promise<void> => {
			const predicateWhere:
				| { id: number; userId?: undefined }
				| { id: number; userId: number } =
				role === Role.moderator ? { id } : { id, userId };
			const deleteOffer: { count: number } =
				await this.prismaService.offer.deleteMany({
					where: { ...predicateWhere, NOT: { status: OfferStatus.won } },
				});
			if (!deleteOffer.count)
				throw new InternalServerErrorException(
					AppErrors.INTERNAL_SERVER_ERROR_TRY_AGAIN_LATER,
				);
			if (offerData.fileName) {
				this.fileService.removeFile(offerData.fileName);
			}
			if (role === Role.moderator) {
				await this.mailService.sendMail(
					offerData.user.email,
					AppMessages.MSG_EMAIL_MODERATOR_REJECT,
					{
						text: offerData.text,
						originalFileName: offerData.originalFileName,
						title: offerData.contest.title,
						firstName: offerData.contest.user.firstName,
						lastName: offerData.contest.user.lastName,
					},
				);
			}
		});
		return { message: AppMessages.MSG_OFFER_DELETED };
	}

	public async setOfferStatus(
		dto: SetOfferStatusFromCustomerDto | SetOfferStatusFromModeratorDto,
		role: Role,
		userId: number,
	): Promise<OfferUpdateDto> {
		if (
			role === Role.customer &&
			!(dto instanceof SetOfferStatusFromModeratorDto)
		) {
			const changePermissionCheck: Contest =
				await this.prismaService.contest.findFirst({
					where: { userId, id: +dto.contestId, status: ContestStatus.active },
				});
			if (!changePermissionCheck)
				throw new ForbiddenException(AppErrors.NOT_ENOUGH_RIGHTS);
		}
		return this.setStatus(dto);
	}

	private async setStatus(
		dto: SetOfferStatusFromCustomerDto | SetOfferStatusFromModeratorDto,
	): Promise<OfferUpdateDto> {
		return !(dto instanceof SetOfferStatusFromModeratorDto) &&
			!dto.hasOwnProperty('emailCustomer')
			? dto.command === OFFER_STATUS_COMMAND.reject
				? this.rejectOffer(+dto.offerId, dto.emailCreator)
				: dto.command === OFFER_STATUS_COMMAND.resolve &&
				  this.resolveOffer(
						+dto.contestId,
						+dto.creatorId,
						dto.orderId,
						+dto.offerId,
						+dto.priority,
				  )
			: !(dto instanceof SetOfferStatusFromCustomerDto) &&
					dto.command === OFFER_STATUS_COMMAND.active &&
					this.activeOffer(+dto.offerId, dto.emailCreator, dto.emailCustomer);
	}

	private async rejectOffer(
		offerId: number,
		emailCreator: string,
	): Promise<OfferUpdateDto> {
		const { contest, ...dataOffer }: OfferUpdateOneDto =
			await this.prismaService.offer.update({
				data: { status: OfferStatus.rejected },
				where: { id: offerId },
				select: {
					...OfferConstants.SELECT_FIELD_OFFER,
					contest: {
						select: {
							title: true,
							user: { select: { firstName: true, lastName: true } },
						},
					},
				},
			});
		if (!dataOffer)
			throw new BadRequestException(
				AppErrors.INTERNAL_SERVER_ERROR_TRY_AGAIN_LATER,
			);
		await this.mailService.sendMail(
			emailCreator,
			AppMessages.MSG_EMAIL_CUSTOMER_REJECT,
			{
				text: dataOffer.text,
				originalFileName: dataOffer.originalFileName,
				title: contest.title,
				firstName: contest.user.firstName,
				lastName: contest.user.lastName,
			},
		);
		return dataOffer;
	}

	private async resolveOffer(
		contestId: number,
		creatorId: number,
		orderId: string,
		offerId: number,
		priority: number,
	): Promise<OfferUpdateDto> {
		return this.prismaService.$transaction(
			async (): Promise<OfferUpdateDto> => {
				const contestsByOrder: Contest[] = await this.changeContestStatus(
					contestId,
					priority,
					orderId,
				);
				const finishedContestPrize: Contest[] = contestsByOrder.filter(
					(contest: Contest): boolean =>
						contest.id === contestId &&
						contest.status === ContestStatus.finished,
				);
				await this.userService.updateUser(
					creatorId,
					{ balance: { increment: finishedContestPrize[0].price } },
					null,
				);
				const updatedOffers: OfferUpdateManyDto[] =
					await this.changeOffersStatus(offerId, contestId);
				for (const offer of updatedOffers) {
					if (offer.status === OfferStatus.rejected) {
						await this.mailService.sendMail(
							offer.email,
							AppMessages.MSG_EMAIL_CUSTOMER_REJECT,
							{
								text: offer.text,
								originalFileName: offer.originalFileName,
								title: offer.title,
								firstName: offer.first_name,
								lastName: offer.last_name,
							},
						);
					}
				}
				const {
					email,
					title,
					first_name,
					last_name,
					...offerData
				}: OfferUpdateManyDto = updatedOffers.filter(
					(Offer: OfferUpdateManyDto) =>
						Offer.status === OfferStatus.won && Offer.id === offerId,
				)[0];
				await this.mailService.sendMail(
					email,
					AppMessages.MSG_EMAIL_CUSTOMER_RESOLVE,
					{
						text: offerData.text,
						originalFileName: offerData.originalFileName,
						title,
						firstName: first_name,
						lastName: last_name,
					},
				);
				return offerData;
			},
		);
	}

	private async activeOffer(
		offerId: number,
		emailCreator: string,
		emailCustomer: string,
	): Promise<OfferUpdateDto> {
		const { contest, ...dataOffer }: OfferUpdateOneDto =
			await this.prismaService.offer.update({
				data: { status: OfferStatus.active },
				where: { id: offerId },
				select: {
					...OfferConstants.SELECT_FIELD_OFFER,
					contest: {
						select: {
							title: true,
							user: { select: { firstName: true, lastName: true } },
						},
					},
				},
			});
		await this.mailService.sendMail(
			emailCreator,
			AppMessages.MSG_EMAIL_CUSTOMER_RESOLVE,
			{
				text: dataOffer.text,
				originalFileName: dataOffer.originalFileName,
				title: contest.title,
				firstName: contest.user.firstName,
				lastName: contest.user.lastName,
			},
		);
		await this.mailService.sendMail(
			emailCustomer,
			AppMessages.MSG_EMAIL_MODERATOR_ACTIVE_FOR_CUSTOMER,
			{
				text: dataOffer.text,
				originalFileName: dataOffer.originalFileName,
				title: contest.title,
				firstName: contest.user.firstName,
				lastName: contest.user.lastName,
			},
		);
		return dataOffer;
	}

	private changeContestStatus(
		contestId: number,
		priority: number,
		orderId: string,
	): Promise<Contest[]> {
		try {
			return this.prismaService.$queryRaw<Contest[]>`
		    UPDATE public.contests SET "status" =
					CASE
		      	WHEN "id"=${contestId} 
		      	    THEN "ContestStatus"'finished'
		        WHEN "status"='pending' AND "priority"=${priority + 1} 
		            THEN "ContestStatus"'active'
		      	ELSE "status"
		      END
		    	WHERE "order_id"=${orderId} 
		    RETURNING *`;
		} catch (e) {
			throw new InternalServerErrorException(AppErrors.CANNOT_UPDATE_CONTEST, {
				cause: e,
			});
		}
	}

	private async changeOffersStatus(
		offerId: number,
		contestId: number,
	): Promise<OfferUpdateManyDto[]> {
		try {
			return this.prismaService.$queryRaw<OfferUpdateManyDto[]>`
		    UPDATE offers SET "status" =
					CASE
		      	WHEN "id"=${offerId} THEN "OfferStatus"'won'
		      	ELSE "OfferStatus"'rejected'
		      END
		    	WHERE "contest_id"=${contestId} 
		    RETURNING id, text, original_file_name, file_name, status,
		    	(SELECT email FROM users WHERE id=offers.user_id) as email,
    			(SELECT title FROM contests WHERE id=offers.contest_id) as title,
					(SELECT first_name FROM (SELECT first_name, contests.id 
						FROM contests JOIN users ON contests.user_id = users.id) as data 
						WHERE data.id=offers.contest_id) as first_name,
					(SELECT last_name FROM (SELECT last_name, contests.id 
						FROM contests JOIN users ON contests.user_id = users.id) as data 
						WHERE data.id=offers.contest_id) as last_name`;
		} catch (e) {
			throw new InternalServerErrorException(AppErrors.CANNOT_UPDATE_OFFER, {
				cause: e,
			});
		}
	}

	private createOffersPredicates(
		id: number,
		role: Role,
		contestId: number,
	): Prisma.OfferFindManyArgs {
		const predicates: {
			where: Prisma.OfferWhereInput;
			orderBy: Prisma.OfferOrderByWithRelationInput[];
			select: Prisma.OfferSelect;
		} = {
			where: { contestId },
			orderBy: [{ status: 'desc' }, { id: 'desc' }],
			select: {
				id: true,
				text: true,
				fileName: true,
				originalFileName: true,
				status: true,
			},
		};
		if (role === Role.moderator) {
			Object.assign(predicates.where, {
				status: OfferStatus.pending,
			});
			Object.assign(predicates.select, {
				user: {
					select: {
						email: true,
					},
				},
				contest: {
					select: {
						user: {
							select: {
								email: true,
							},
						},
					},
				},
			});
		} else {
			Object.assign(predicates.select, {
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						avatar: true,
						rating: true,
					},
				},
			});
		}
		if (role === Role.creator) {
			Object.assign(predicates.where, {
				userId: id,
			});
			Object.assign(predicates.select, {
				ratings: {
					select: {
						mark: true,
					},
				},
			});
		}
		if (role === Role.customer) {
			Object.assign(predicates.where, {
				status: OfferStatus.active,
			});
			Object.assign(predicates.select, {
				ratings: {
					where: {
						userId: id,
					},
					select: {
						mark: true,
					},
				},
			});
		}
		return predicates;
	}
}
