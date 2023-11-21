import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { isNumber } from 'class-validator';
import * as bcrypt from 'bcrypt';

import { User } from '@prisma/client';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { AuthService } from '../../src/modules/auth/auth.service';
import { AppModule } from '../../src/modules/app/app.module';
import { userMockDataFirstCustomer } from '../mockData';
import { DEFAULT_AVATAR_NAME } from '../../src/common/constants/common.constants';
import { CreateUserDto } from '../../src/common/dto/user';
import { IAuthUser, IJwtPayload } from '../../src/common/interfaces/auth';
import { CommonConstants } from '../../src/common/constants';

describe('Auth Service', (): void => {
	let app: INestApplication;
	let prisma: PrismaService;
	let authService: AuthService;
	let jwtService: JwtService;
	let configService: ConfigService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		app = moduleFixture.createNestApplication();
		prisma = app.get<PrismaService>(PrismaService);
		authService = app.get<AuthService>(AuthService);
		jwtService = app.get<JwtService>(JwtService);
		configService = app.get<ConfigService>(ConfigService);
		await app.init();
	});

	beforeEach(async (): Promise<void> => {
		const hashPassword = async (password: string): Promise<string> => {
			const salt: number | string = await bcrypt.genSalt();
			return bcrypt.hash(password, salt);
		};
		await prisma.user.create({
			data: {
				...userMockDataFirstCustomer,
				password: await hashPassword(userMockDataFirstCustomer.password),
			},
		});
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

	it('should validate user', async (): Promise<void> => {
		const user: User = await authService.validateUser(
			userMockDataFirstCustomer.email,
			userMockDataFirstCustomer.password,
		);

		const passwordValid: boolean = await bcrypt.compare(
			userMockDataFirstCustomer.password,
			user.password,
		);

		expect(isNumber(user.id)).toBe(true);
		expect(user.firstName).toBe(userMockDataFirstCustomer.firstName);
		expect(user.lastName).toBe(userMockDataFirstCustomer.lastName);
		expect(user.displayName).toBe(userMockDataFirstCustomer.displayName);
		expect(passwordValid).toBe(true);
		expect(user.avatar).toBe(DEFAULT_AVATAR_NAME);
		expect(user.role).toBe(userMockDataFirstCustomer.role);
		expect(+user.balance).toBe(0);
		expect(+user.rating).toBe(0);
		expect(user.createdAt).toBeInstanceOf(Date);
		expect(user.updatedAt).toBeInstanceOf(Date);
	});

	it('should register user', async (): Promise<void> => {
		await prisma.user.delete({
			where: { email: userMockDataFirstCustomer.email },
		});

		const { tokens }: IAuthUser = await authService.register(
			userMockDataFirstCustomer as CreateUserDto,
		);

		const checkAtToken: IJwtPayload = jwtService.verify(tokens.accessToken);
		const checkRtToken: IJwtPayload = jwtService.verify(tokens.refreshToken, {
			secret: configService.get<string>('secretRt'),
		});

		expect(checkAtToken.user).toEqual(checkRtToken.user);
		expect(isNumber(checkAtToken.user.id)).toBe(true);
		expect(checkAtToken.user.displayName).toBe(
			userMockDataFirstCustomer.displayName,
		);
		expect(checkAtToken.user.role).toBe(userMockDataFirstCustomer.role);
		expect(checkAtToken.user.avatar).toBe(CommonConstants.DEFAULT_AVATAR_NAME);
		expect(isNumber(checkAtToken.iat)).toBe(true);
		expect(isNumber(checkAtToken.exp)).toBe(true);
	});

	it('should login user', async (): Promise<void> => {
		const { tokens }: IAuthUser = await authService.login({
			email: userMockDataFirstCustomer.email,
			password: userMockDataFirstCustomer.password,
		});

		const checkAtToken: IJwtPayload = jwtService.verify(tokens.accessToken);
		const checkRtToken: IJwtPayload = jwtService.verify(tokens.refreshToken, {
			secret: configService.get<string>('secretRt'),
		});

		expect(checkAtToken.user).toEqual(checkRtToken.user);
		expect(isNumber(checkAtToken.user.id)).toBe(true);
		expect(checkAtToken.user.displayName).toBe(
			userMockDataFirstCustomer.displayName,
		);
		expect(checkAtToken.user.role).toBe(userMockDataFirstCustomer.role);
		expect(checkAtToken.user.avatar).toBe(CommonConstants.DEFAULT_AVATAR_NAME);
		expect(isNumber(checkAtToken.iat)).toBe(true);
		expect(isNumber(checkAtToken.exp)).toBe(true);
	});

	it('should logout user', async (): Promise<void> => {
		const { tokens }: IAuthUser = await authService.login({
			email: userMockDataFirstCustomer.email,
			password: userMockDataFirstCustomer.password,
		});

		const userInfo: IJwtPayload = jwtService.verify(tokens.accessToken);
		const userLogout: boolean = await authService.logout(userInfo.user.id);
		const userDataDb: User = await prisma.user.findUnique({
			where: { id: userInfo.user.id },
		});

		expect(userLogout).toBe(true);
		expect(userDataDb).toHaveProperty('refreshToken', '');
	});

	it('should refresh tokens', async (): Promise<void> => {
		const oldTokens: IAuthUser = await authService.login({
			email: userMockDataFirstCustomer.email,
			password: userMockDataFirstCustomer.password,
		});

		const userInfo: IJwtPayload = jwtService.verify(
			oldTokens.tokens.accessToken,
		);
		const { tokens }: IAuthUser = await authService.refreshTokens(
			userInfo.user.id,
			oldTokens.tokens.refreshToken,
		);

		const checkAtToken: IJwtPayload = jwtService.verify(tokens.accessToken);
		const checkRtToken: IJwtPayload = jwtService.verify(tokens.refreshToken, {
			secret: configService.get<string>('secretRt'),
		});

		expect(checkAtToken.user).toEqual(checkRtToken.user);
		expect(tokens).toHaveProperty('accessToken');
		expect(tokens).toHaveProperty('refreshToken');
		expect(tokens.accessToken).not.toEqual([null, undefined]);
		expect(tokens.refreshToken).not.toEqual([null, undefined]);
	});
});
