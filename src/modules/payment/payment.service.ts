import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import * as uuid from 'uuid';

import { Bank, ContestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ContestService } from '../contest/contest.service';
import {
	LogoCreateContestPayDto,
	NameCreateContestPayDto,
	PayDto,
	TaglineCreateContestPayDto,
} from '../../common/dto/payment';
import { AppErrors } from '../../common/errors';
import {
	ICreatContest,
	ICreateBulkContest,
} from '../../common/interfaces/contest';
import { PayConstants } from './../../common/constants';

@Injectable()
export class PaymentService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly contestService: ContestService,
	) {}

	public async payment(id: number, dto: PayDto): Promise<number> {
		const { number, cvc, expiry, totalPrice, contests }: PayDto = dto;
		await this.verifyCard(number, cvc, expiry, totalPrice);
		const dataContests: ICreateBulkContest = this.createDataForCreateContests(
			id,
			contests,
		);
		return await this.prisma.$transaction(async (): Promise<number> => {
			await this.updateBalance(
				{ balance: { decrement: totalPrice } },
				number,
				cvc,
				expiry,
			);
			await this.updateBalance(
				{ balance: { increment: totalPrice } },
				PayConstants.SQUADHELP_BANK_NUMBER,
				PayConstants.SQUADHELP_BANK_CVC,
				PayConstants.SQUADHELP_BANK_EXPIRY,
			);
			return await this.contestService.createContests(dataContests);
		});
	}

	public async cashOut(): Promise<any> {}

	private async updateBalance(data, number, cvc, expiry): Promise<void> {
		try {
			await this.prisma.bank.updateMany({
				data,
				where: {
					cardNumber: number.replace(/ /g, ''),
					cvc: cvc,
					expiry: expiry,
				},
			});
		} catch (e) {
			throw new InternalServerErrorException(
				AppErrors.INTERNAL_SERVER_BANK_ERROR_TRY_AGAIN_LATER,
				{
					cause: e,
				},
			);
		}
	}

	private async verifyCard(number, cvc, expiry, totalPrice): Promise<void> {
		const dataBank: Bank = await this.prisma.bank.findFirst({
			where: {
				cardNumber: number.replace(/ /g, ''),
				cvc: cvc,
				expiry: expiry,
			},
		});
		if (!dataBank) {
			throw new BadRequestException(AppErrors.INCORRECT_PAYMENT_CARD_DETAILS);
		}
		if (dataBank.balance < totalPrice)
			throw new BadRequestException(AppErrors.INSUFFICIENT_FUNDS_TO_PAY);
	}

	private createDataForCreateContests(id, contests): ICreateBulkContest {
		const orderId: string = uuid.v4();
		contests.map(
			(
				contest:
					| NameCreateContestPayDto
					| LogoCreateContestPayDto
					| TaglineCreateContestPayDto,
				index: number,
			): void => {
				contests[index] = Object.assign({} as ICreatContest, contest, {
					status: index === 0 ? ContestStatus.active : ContestStatus.pending,
					userId: id,
					priority: index + 1,
					orderId,
					price: +contest.price,
				});
			},
		);
		return contests;
	}
}
