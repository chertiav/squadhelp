import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { AppModule } from '../../src/modules/app/app.module';
import {
	userMockDataFirstCreator,
	userMockDataFirstCustomer,
	paymentCashoutMockData,
	paymentPayMockData,
} from '../mockData';
import { PaymentService } from '../../src/modules/payment/payment.service';
import { seedBankData } from '../../prisma/seeders/data';
import {
	LogoCreateContestPayDto,
	NameCreateContestPayDto,
	TaglineCreateContestPayDto,
} from '../../src/common/dto/payment';
import { BalanceUserDto } from '../../src/common/dto/user';

describe('Payment service', (): void => {
	let app: INestApplication;
	let prisma: PrismaService;
	let paymentService: PaymentService;
	let userIdFirstCustomer: { id: number };
	let userIdFirstCreator: { id: number };

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		app = moduleFixture.createNestApplication();
		prisma = app.get<PrismaService>(PrismaService);
		paymentService = app.get<PaymentService>(PaymentService);
		await app.init();
	});

	beforeEach(async (): Promise<void> => {
		const hashPassword = async (password: string): Promise<string> => {
			const salt: number | string = await bcrypt.genSalt();
			return bcrypt.hash(password, salt);
		};

		await prisma.user.createMany({
			data: [
				{
					...userMockDataFirstCustomer,
					password: await hashPassword(userMockDataFirstCustomer.password),
				},
				{
					...userMockDataFirstCreator,
					password: await hashPassword(userMockDataFirstCreator.password),
				},
			],
		});
		userIdFirstCustomer = await prisma.user.findUnique({
			where: { email: userMockDataFirstCustomer.email },
			select: { id: true },
		});
		userIdFirstCreator = await prisma.user.findUnique({
			where: { email: userMockDataFirstCreator.email },
			select: { id: true },
		});
	});

	afterEach(async (): Promise<void> => {
		await prisma.contest.deleteMany({
			where: {},
		});
		await prisma.user.deleteMany({
			where: {
				email: {
					in: [userMockDataFirstCustomer.email, userMockDataFirstCreator.email],
				},
			},
		});
		await prisma.bank.deleteMany({ where: {} });
		await prisma.bank.createMany({ data: seedBankData });
		userIdFirstCustomer = { id: null };
		userIdFirstCreator = { id: null };
	});

	afterAll(async (): Promise<void> => {
		await prisma.$disconnect();
		await app.close();
	});

	it(`should pay and create contests`, async (): Promise<void> => {
		const contestData: (
			| NameCreateContestPayDto
			| LogoCreateContestPayDto
			| TaglineCreateContestPayDto
		)[] = paymentPayMockData.contests.map(
			(
				contest:
					| NameCreateContestPayDto
					| LogoCreateContestPayDto
					| TaglineCreateContestPayDto,
			) => {
				delete contest.haveFile;
				return contest;
			},
		);

		const response: number = await paymentService.payment(
			userIdFirstCustomer.id,
			{
				...paymentPayMockData,
				contests: contestData,
			},
		);
		expect(response).toBe(paymentPayMockData.contests.length);
	});
	it(`should cashout`, async (): Promise<void> => {
		await prisma.bank.update({
			data: { balance: { increment: paymentCashoutMockData.sum } },
			where: { cardNumber: paymentCashoutMockData.number },
		});
		await prisma.user.update({
			data: { balance: { increment: paymentCashoutMockData.sum } },
			where: { email: userMockDataFirstCreator.email },
		});

		const response: BalanceUserDto = await paymentService.cashOut(
			paymentCashoutMockData,
			userIdFirstCreator.id,
		);
		expect(+response.balance).toBe(0);
	});
});
