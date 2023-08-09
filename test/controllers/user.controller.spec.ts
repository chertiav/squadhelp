import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { isNumber, useContainer } from 'class-validator';
import * as bcrypt from 'bcrypt';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';

import {
	userMockDataCreator,
	userMockDataCustomer,
	userUpdateMockData,
} from '../mockData';
import { AppModule } from '../../src/modules/app/app.module';
import { AppMessages } from '../../src/common/messages';
import { CommonConstants } from '../../src/common/constants';

describe('User Controller', (): void => {
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
					...userMockDataCustomer,
					password: await hashPassword(userMockDataCustomer.password),
				},
				{
					...userMockDataCreator,
					password: await hashPassword(userMockDataCreator.password),
				},
			],
		});
	});

	afterEach(async (): Promise<void> => {
		await prisma.user.deleteMany({
			where: {
				email: {
					in: [userMockDataCustomer.email, userMockDataCreator.email],
				},
			},
		});
	});

	afterAll(async (): Promise<void> => {
		await prisma.$disconnect();
		await app.close();
	});

	it('should update user', async (): Promise<void> => {
		const login: request.Response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: userMockDataCustomer.email,
				password: userMockDataCustomer.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.patch('/user/update')
			.set('Cookie', login.headers['set-cookie'])
			.send(userUpdateMockData);

		expect(response.body.user.firstName).toBe(userUpdateMockData.firstName);
		expect(response.body.user.lastName).toBe(userUpdateMockData.lastName);
		expect(response.body.user.avatar).toBe(userUpdateMockData.avatar);
		expect(isNumber(response.body.user.id)).toBe(true);
		expect(response.body.user.role).toBe(userMockDataCustomer.role);
		expect(response.body.user.email).toBe(userMockDataCustomer.email);
		expect(response.body.message).toBe(
			AppMessages.MSG_USER_INFORMATION_UPDATED,
		);
		expect(response.status).toBe(HttpStatus.OK);
	});

	it('should get user info', async (): Promise<void> => {
		const login: request.Response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: userMockDataCustomer.email,
				password: userMockDataCustomer.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.get('/user/info')
			.set('Cookie', login.headers['set-cookie']);

		expect(response.body.firstName).toBe(userMockDataCustomer.firstName);
		expect(response.body.lastName).toBe(userMockDataCustomer.lastName);
		expect(response.body.avatar).toBe(CommonConstants.DEFAULT_AVATAR_NAME);
		expect(isNumber(response.body.id)).toBe(true);
		expect(response.body.role).toBe(userMockDataCustomer.role);
		expect(response.body.email).toBe(userMockDataCustomer.email);
		expect(response.status).toBe(HttpStatus.OK);
	});

	it("should get user's balance", async (): Promise<void> => {
		const login: request.Response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: userMockDataCreator.email,
				password: userMockDataCreator.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.get('/user/balance')
			.set('Cookie', login.headers['set-cookie']);

		expect(response.body.balance).toBe('0');
		expect(response.status).toBe(HttpStatus.OK);
	});
});