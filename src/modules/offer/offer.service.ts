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
	OfferDataDto,
	DeleteOfferResDto,
	SetOfferStatusDto,
	OfferUpdateDto,
} from '../../common/dto/offer';
import { AppErrors } from '../../common/errors';
import {
	Contest,
	ContestStatus,
	Offer,
	OfferStatus,
	Role,
} from '@prisma/client';
import { AppMessages } from '../../common/messages';
import { IDeleteOfferCheck } from '../../common/interfaces/offer';
import { OFFER_STATUS_COMMAND } from '../../common/enum';
import { OfferConstants } from '../../common/constants';
import { UserService } from '../user/user.service';

@Injectable()
export class OfferService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly fileService: FileService,
		private readonly userService: UserService,
	) {}

	public async createOffer(
		userId: number,
		dto: CreateOfferDto,
	): Promise<OfferDataDto> {
		try {
			const {
				customerId, // нужно для socket.io
				...dataContest
			}: CreateOfferDto = dto;
			return this.prisma.offer.create({
				data: { userId, ...dataContest, contestId: +dataContest.contestId },
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
				},
			});
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
		const offerData: IDeleteOfferCheck = await this.prisma.offer.findFirst({
			where: {
				...predicateWhere,
				NOT: { status: OfferStatus.won },
			},
			select: {
				fileName: true,
				user: {
					select: {
						email: true,
					},
				},
			},
		});
		if (!offerData)
			throw new BadRequestException(
				AppErrors.OFFER_WITH_THIS_ID_DOES_NOT_EXISTS,
			);
		await this.prisma.$transaction(async (): Promise<void> => {
			const predicateWhere:
				| { id: number; userId?: undefined }
				| { id: number; userId: number } =
				role === Role.moderator ? { id } : { id, userId };
			const deleteOffer: { count: number } = await this.prisma.offer.deleteMany(
				{
					where: {
						...predicateWhere,
						NOT: { status: OfferStatus.won },
					},
				},
			);
			if (!deleteOffer.count)
				throw new InternalServerErrorException(
					AppErrors.INTERNAL_SERVER_ERROR_TRY_AGAIN_LATER,
				);
			if (offerData.fileName) {
				this.fileService.removeFile(offerData.fileName);
			}
			if (role === Role.moderator) {
				console.log('отправка уведомления');
			}
		});
		return { message: AppMessages.MSG_OFFER_DELETED };
	}

	public async setOfferStatus(
		dto: SetOfferStatusDto,
		role: Role,
		userId: number,
	): Promise<OfferUpdateDto> {
		if (role === Role.customer) {
			const changePermissionCheck: Contest =
				await this.prisma.contest.findFirst({
					where: { userId, id: +dto.contestId, status: ContestStatus.active },
				});
			if (!changePermissionCheck)
				throw new ForbiddenException(AppErrors.NOT_ENOUGH_RIGHTS);
		}
		return this.setStatus(dto);
	}

	private async setStatus(dto: SetOfferStatusDto): Promise<OfferUpdateDto> {
		const {
			command,
			offerId,
			creatorId,
			contestId,
			orderId,
			priority,
			email,
		}: SetOfferStatusDto = dto;
		if (command === OFFER_STATUS_COMMAND.reject) {
			return await this.rejectOffer(+offerId, +creatorId, +contestId);
		} else if (command === OFFER_STATUS_COMMAND.resolve) {
			return await this.resolveOffer(
				+contestId,
				+creatorId,
				orderId,
				+offerId,
				+priority,
			);
		} else if (command === OFFER_STATUS_COMMAND.active) {
			return await this.activeOffer(+offerId, email);
		}
	}

	private async rejectOffer(
		offerId: number,
		creatorId: number, // нужно для socket.io
		contestId: number, // нужно для socket.io
	): Promise<OfferUpdateDto> {
		const updateOffer: OfferUpdateDto = await this.prisma.offer.update({
			data: { status: OfferStatus.rejected },
			where: { id: offerId },
			select: {
				...OfferConstants.SELECT_FIELD_OFFER,
			},
		});
		if (!updateOffer)
			throw new BadRequestException(
				AppErrors.INTERNAL_SERVER_ERROR_TRY_AGAIN_LATER,
			);
		return updateOffer;
	}

	private async resolveOffer(
		contestId: number,
		creatorId: number,
		orderId: string,
		offerId: number,
		priority: number,
	): Promise<OfferUpdateDto> {
		return this.prisma.$transaction(async (): Promise<OfferUpdateDto> => {
			const contestsByOrder: Contest[] = await this.changeContestStatus(
				contestId,
				priority,
				orderId,
			);
			const finishedContestPrize: Contest[] = contestsByOrder.filter(
				(contest: Contest): boolean =>
					contest.id === contestId && contest.status === ContestStatus.finished,
			);
			await this.userService.updateUser(
				creatorId,
				{ balance: { increment: finishedContestPrize[0].price } },
				null,
			);
			const updatedOffers: Offer[] = await this.changeOffersStatus(
				offerId,
				contestId,
			);
			return updatedOffers.filter(
				(Offer: Offer) =>
					Offer.status === OfferStatus.won && Offer.id === offerId,
			)[0];
		});
	}

	private async activeOffer(
		offerId: number,
		email: string,
	): Promise<OfferUpdateDto> {
		return this.prisma.offer.update({
			data: { status: OfferStatus.active },
			where: { id: offerId },
			select: {
				...OfferConstants.SELECT_FIELD_OFFER,
			},
		});
	}

	private changeContestStatus = (
		contestId: number,
		priority: number,
		orderId: string,
	): Promise<Contest[]> => {
		try {
			return this.prisma.$queryRaw<Contest[]>`
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
	};

	private async changeOffersStatus(
		offerId: number,
		contestId: number,
	): Promise<Offer[]> {
		try {
			return this.prisma.$queryRaw<Offer[]>`
		    UPDATE public.offers SET "status" =
					CASE
		      	WHEN "id"=${offerId} THEN "OfferStatus"'won'
		      	ELSE "OfferStatus"'rejected'
		      END
		    	WHERE "contest_id"=${contestId} 
		    RETURNING "id", "text", "original_file_name", "file_name", "status"`;
		} catch (e) {
			throw new InternalServerErrorException(AppErrors.CANNOT_UPDATE_OFFER, {
				cause: e,
			});
		}
	}
}
