import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import {
	CreateOfferDto,
	CreateOfferDataDto,
	DeleteOfferResDto,
} from '../../common/dto/offer';
import { AppErrors } from '../../common/errors';
import { OfferStatus, Role } from '@prisma/client';
import { AppMessages } from '../../common/messages';
import { IDeleteOfferCheck } from '../../common/interfaces/offer';

@Injectable()
export class OfferService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly fileService: FileService,
	) {}

	public async createOffer(
		userId: number,
		dto: CreateOfferDto,
	): Promise<CreateOfferDataDto> {
		try {
			const { customerId, ...dataContest }: CreateOfferDto = dto;
			return this.prisma.offer.create({
				data: { userId, ...dataContest, contestId: +dataContest.contestId },
				select: {
					id: true,
					text: true,
					originalFileName: true,
					fileName: true,
					status: true,
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
}
