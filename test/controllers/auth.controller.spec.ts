import {
	HttpStatus,
	INestApplication,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import * as bcrypt from 'bcrypt';

import { AppMessages } from '../../src/common/messages';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { AppModule } from '../../src/modules/app/app.module';
import { userMockDataFirstCustomer } from '../mockData';

describe('Auth Controller', (): void => {
	let app: INestApplication;
	let prisma: PrismaService;
	const salt: string | number = bcrypt.genSaltSync();
	const hashPassword: string = bcrypt.hashSync(
		userMockDataFirstCustomer.password,
		salt,
	);

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

	afterEach(async (): Promise<void> => {
		await prisma.user.delete({
			where: { email: userMockDataFirstCustomer.email },
		});
	});

	afterAll(async (): Promise<void> => {
		await prisma.$disconnect();
		await app.close();
	});

	it('should create user', async (): Promise<void> => {
		const response: request.Response = await request(app.getHttpServer())
			.post('/v1/auth/register')
			.send(userMockDataFirstCustomer);

		expect(response.body.accessToken).not.toEqual([null, undefined]);
		expect(response.body.message).toBe(AppMessages.MSG_REGISTER);
		expect(response.status).toBe(HttpStatus.CREATED);
	});

	it('should login user', async (): Promise<void> => {
		await prisma.user.create({
			data: { ...userMockDataFirstCustomer, password: hashPassword },
		});

		const response: request.Response = await request(app.getHttpServer())
			.post('/v1/auth/login')
			.send({
				email: userMockDataFirstCustomer.email,
				password: userMockDataFirstCustomer.password,
			});

		expect(response.body.accessToken).not.toEqual([null, undefined]);
		expect(response.body.message).toBe(AppMessages.MSG_LOGGED_IN);
		expect(response.status).toBe(HttpStatus.OK);
	});

	it('should refresh tokens', async (): Promise<void> => {
		await prisma.user.create({
			data: { ...userMockDataFirstCustomer, password: hashPassword },
		});

		const login: request.Response = await request(app.getHttpServer())
			.post('/v1/auth/login')
			.send({
				email: userMockDataFirstCustomer.email,
				password: userMockDataFirstCustomer.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.get('/v1/auth/refresh')
			.set('Cookie', login.headers['set-cookie']);

		expect(response.body.accessToken).not.toEqual([null, undefined]);
		expect(response.status).toBe(HttpStatus.OK);
	});

	it('should logout', async (): Promise<void> => {
		await prisma.user.create({
			data: { ...userMockDataFirstCustomer, password: hashPassword },
		});

		const login: request.Response = await request(app.getHttpServer())
			.post('/v1/auth/login')
			.send({
				email: userMockDataFirstCustomer.email,
				password: userMockDataFirstCustomer.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.get('/v1/auth/logout')
			.set('Cookie', login.headers['set-cookie']);

		expect(response.body.message).toBe(AppMessages.MSG_LOGGED_OUT);
		expect(response.status).toBe(HttpStatus.OK);
	});
});
