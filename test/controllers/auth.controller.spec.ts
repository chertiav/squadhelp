import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { isNumber, useContainer } from 'class-validator';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import * as bcrypt from 'bcrypt';

import { AppMessages } from '../../src/common/messages';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { AppModule } from '../../src/modules/app/app.module';
import { userMockData } from '../mockData';
import { CommonConstants } from '../../src/common/constants';

describe('Auth Controller', () => {
	let app: INestApplication;
	let prisma: PrismaService;
	const salt: string | number = bcrypt.genSaltSync();
	const hashPassword: string = bcrypt.hashSync(userMockData.password, salt);

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

	afterEach(async (): Promise<void> => {
		await prisma.user.delete({ where: { email: userMockData.email } });
	});

	afterAll(async (): Promise<void> => {
		await prisma.$disconnect();
		await app.close();
	});

	it('should create user', async (): Promise<void> => {
		const response: request.Response = await request(app.getHttpServer())
			.post('/auth/register')
			.send(userMockData);

		expect(isNumber(response.body.user.id)).toBe(true);
		expect(response.body.user.displayName).toBe(userMockData.displayName);
		expect(response.body.user.role).toBe(userMockData.role);
		expect(response.body.user.avatar).toBe(CommonConstants.DEFAULT_AVATAR_NAME);
		expect(response.body.message).toBe(AppMessages.MSG_REGISTER);
		expect(response.status).toBe(HttpStatus.CREATED);
	});

	it('should login user', async (): Promise<void> => {
		const testUser = await prisma.user.create({
			data: { ...userMockData, password: hashPassword },
		});

		const response: request.Response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({ email: userMockData.email, password: userMockData.password });

		expect(response.body.user.id).toBe(testUser.id);
		expect(response.body.user.displayName).toBe(userMockData.displayName);
		expect(response.body.user.role).toBe(userMockData.role);
		expect(response.body.user.avatar).toBe(CommonConstants.DEFAULT_AVATAR_NAME);
		expect(response.body.message).toBe(AppMessages.MSG_LOGGED_IN);
		expect(response.status).toBe(HttpStatus.OK);
	});

	it('should login check', async (): Promise<void> => {
		await prisma.user.create({
			data: { ...userMockData, password: hashPassword },
		});

		const login: request.Response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({ email: userMockData.email, password: userMockData.password });

		const loginCheck: request.Response = await request(app.getHttpServer())
			.get('/auth/login-check')
			.set('Cookie', login.headers['set-cookie']);

		expect(isNumber(loginCheck.body.id)).toBe(true);
		expect(loginCheck.body.displayName).toBe(userMockData.displayName);
		expect(loginCheck.body.avatar).toBe(CommonConstants.DEFAULT_AVATAR_NAME);
		expect(loginCheck.body.role).toBe(userMockData.role);
	});

	it('should logout', async (): Promise<void> => {
		await prisma.user.create({
			data: { ...userMockData, password: hashPassword },
		});

		const login: request.Response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({ email: userMockData.email, password: userMockData.password });

		const response: request.Response = await request(app.getHttpServer())
			.get('/auth/logout')
			.set('Cookie', login.headers['set-cookie']);

		expect(response.body.message).toBe(AppMessages.MSG_LOGGED_OUT);
		expect(response.status).toBe(HttpStatus.OK);
	});
});
