import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChangeRatingDto, RatingDto } from '../../common/dto/rating';
import { AppErrors } from '../../common/errors';
import { UserService } from '../user/user.service';
import { AppMessages } from '../../common/messages';
import { MailService } from '../mail/mail.service';
import { OfferService } from '../offer/offer.service';
import { OfferConstants } from '../../common/constants';
import { IOfferDataMail } from '../../common/interfaces/offer';

@Injectable()
export class RatingService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly userService: UserService,
		private readonly mailService: MailService,
		private readonly offerService: OfferService,
	) {}

	public async changeRating(
		dto: ChangeRatingDto,
		userId: number,
	): Promise<RatingDto> {
		const { isFirst, offerId, mark, creatorId }: ChangeRatingDto = dto;
		return this.prismaService.$transaction(
			async (): Promise<RatingDto> => {
				await this.setRating(+offerId, userId, mark, isFirst);
				const avg: { _avg: { mark: number } } =
					await this.prismaService.rating.aggregate({
						where: {
							offer: {
								userId: +creatorId,
							},
						},
						_avg: {
							mark: true,
						},
					});
				await this.userService.updateUser(
					+creatorId,
					{ rating: isFirst ? mark : avg._avg.mark },
					null,
				);
				const offerData: IOfferDataMail = await this.offerService.findOneOffer(
					+offerId,
					OfferConstants.SELECT_FIELD_OFFER_DATA_MAIL,
				);
				await this.mailService.sendMail(
					offerData.user.email,
					AppMessages.MSG_EMAIL_RATING,
					{
						text: offerData.text,
						originalFileName: offerData.originalFileName,
						title: offerData.contest.title,
						firstName: offerData.contest.user.firstName,
						lastName: offerData.contest.user.lastName,
					},
				);
				return { userId: +creatorId, rating: avg._avg.mark };
			},
			{ isolationLevel: Prisma.TransactionIsolationLevel.ReadUncommitted },
		);
	}

	private async createRating(
		offerId: number,
		userId: number,
		mark: number,
	): Promise<void> {
		try {
			await this.prismaService.rating.create({
				data: { offerId, userId, mark },
			});
		} catch (e) {
			throw new InternalServerErrorException(AppErrors.CANNOT_MARK_OFFER);
		}
	}

	private async updateRating(
		offerId: number,
		userId: number,
		mark: number,
	): Promise<void> {
		try {
			await this.prismaService.rating.update({
				data: { mark },
				where: { offerId_userId: { offerId, userId } },
			});
		} catch (e) {
			throw new InternalServerErrorException(
				AppErrors.CANNOT_UPDATE_MARK_ON_THIS_OFFER,
			);
		}
	}

	private setRating = (
		offerId: number,
		userId: number,
		mark: number,
		isFirst: boolean,
	): Promise<void> => {
		return isFirst
			? this.createRating(offerId, userId, mark)
			: this.updateRating(offerId, userId, mark);
	};
}
