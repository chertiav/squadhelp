import {
	HttpStatus,
	INestApplication,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { isObject, useContainer } from 'class-validator';
import * as bcrypt from 'bcrypt';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { join } from 'path';

import {
	userMockDataFirstCreator,
	userMockDataFirstCustomer,
	paymentCashoutMockData,
	paymentPayMockData,
} from '../mockData';
import { AppModule } from '../../src/modules/app/app.module';
import { AppMessages } from '../../src/common/messages';
import { seedBankData } from '../../prisma/seeders/data';
import {
	LogoCreateContestPayDto,
	NameCreateContestPayDto,
	TaglineCreateContestPayDto,
} from '../../src/common/dto/payment';

describe('Payment controller', (): void => {
	let app: INestApplication;
	let prisma: PrismaService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		app = moduleFixture.createNestApplication();
		prisma = app.get<PrismaService>(PrismaService);
		useContainer(app.select(AppModule), { fallbackOnErrors: true });
		app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
		app.use(cookieParser());
		app.enableVersioning({ type: VersioningType.URI });
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
	});

	afterAll(async (): Promise<void> => {
		await prisma.$disconnect();
		await app.close();
	});

	it(`should pay and create contests without file`, async (): Promise<void> => {
		const login: request.Response = await request(app.getHttpServer())
			.post('/v1/auth/login')
			.send({
				email: userMockDataFirstCustomer.email,
				password: userMockDataFirstCustomer.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.post(`/v1/payment/pay`)
			.set('Cookie', login.headers['set-cookie'])
			.field('number', paymentPayMockData.number)
			.field('expiry', paymentPayMockData.expiry)
			.field('cvc', paymentPayMockData.cvc)
			.field('sum', paymentPayMockData.sum)
			.field('contests', JSON.stringify(paymentPayMockData.contests));

		expect(isObject(response.body)).toBe(true);
		expect(response.body).toHaveProperty(
			'message',
			`${AppMessages.MSG_OPENED_NEW_CONTESTS}: ${paymentPayMockData.contests.length}`,
		);
		expect(response.status).toBe(HttpStatus.CREATED);
	});

	it(`should pay and create contests with file`, async (): Promise<void> => {
		const fileFirstContest: string = join(
			__dirname,
			'../mockImages',
			'sample.pdf',
		);
		const fileSecondContest: string = join(
			__dirname,
			'../mockImages',
			'sample-2.pdf',
		);
		const fileThirdContest: string = join(
			__dirname,
			'../mockImages',
			'sample-3.pdf',
		);
		const contests: (
			| NameCreateContestPayDto
			| TaglineCreateContestPayDto
			| LogoCreateContestPayDto
		)[] = paymentPayMockData.contests.map(
			(
				contest:
					| NameCreateContestPayDto
					| TaglineCreateContestPayDto
					| LogoCreateContestPayDto,
			):
				| NameCreateContestPayDto
				| TaglineCreateContestPayDto
				| LogoCreateContestPayDto => ({
				...contest,
				haveFile: true,
			}),
		);

		const login: request.Response = await request(app.getHttpServer())
			.post('/v1/auth/login')
			.send({
				email: userMockDataFirstCustomer.email,
				password: userMockDataFirstCustomer.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.post(`/v1/payment/pay`)
			.set('Cookie', login.headers['set-cookie'])
			.field('number', paymentPayMockData.number)
			.field('expiry', paymentPayMockData.expiry)
			.field('cvc', paymentPayMockData.cvc)
			.field('sum', paymentPayMockData.sum)
			.field('contests', JSON.stringify(contests))
			.attach('files', fileFirstContest)
			.attach('files', fileSecondContest)
			.attach('files', fileThirdContest);

		expect(isObject(response.body)).toBe(true);
		expect(response.body).toHaveProperty(
			'message',
			`${AppMessages.MSG_OPENED_NEW_CONTESTS}: ${paymentPayMockData.contests.length}`,
		);
		expect(response.status).toBe(HttpStatus.CREATED);
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
		const login: request.Response = await request(app.getHttpServer())
			.post('/v1/auth/login')
			.send({
				email: userMockDataFirstCreator.email,
				password: userMockDataFirstCreator.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.post(`/v1/payment/cashout`)
			.set('Cookie', login.headers['set-cookie'])
			.send(paymentCashoutMockData);

		expect(isObject(response.body)).toBe(true);
		expect(response.body).toHaveProperty('balance', '0');
		expect(response.body).toHaveProperty(
			'message',
			AppMessages.MSG_MONEY_SEND_SUCCESSFULLY,
		);
		expect(response.status).toBe(HttpStatus.OK);
	});
});
