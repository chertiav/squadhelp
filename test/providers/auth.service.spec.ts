import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { isNumber } from 'class-validator';
import * as bcrypt from 'bcrypt';

import { User } from '@prisma/client';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { AuthService } from '../../src/modules/auth/auth.service';
import { AppModule } from '../../src/modules/app/app.module';
import { userMockDataCustomer } from '../mockData';
import { JwtService } from '@nestjs/jwt';
import { DEFAULT_AVATAR_NAME } from '../../src/common/constants/common.constants';
import { CreateUserDto, PublicUserDto } from '../../src/common/dto/user';
import { IJwtPayload } from '../../src/common/interfaces/auth';
import { CommonConstants } from '../../src/common/constants';

describe('Auth Service', (): void => {
	let app: INestApplication;
	let prisma: PrismaService;
	let authService: AuthService;
	let jwtService: JwtService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		app = moduleFixture.createNestApplication();
		prisma = app.get<PrismaService>(PrismaService);
		authService = app.get<AuthService>(AuthService);
		jwtService = app.get<JwtService>(JwtService);
		await app.init();
	});

	beforeEach(async (): Promise<void> => {
		const salt: string | number = await bcrypt.genSalt();
		const hashPassword: string = await bcrypt.hash(
			userMockDataCustomer.password,
			salt,
		);
		await prisma.user.create({
			data: { ...userMockDataCustomer, password: hashPassword },
		});
	});

	afterEach(async (): Promise<void> => {
		await prisma.user.delete({ where: { email: userMockDataCustomer.email } });
	});

	afterAll(async (): Promise<void> => {
		await prisma.$disconnect();
		await app.close();
	});

	it('should validate user', async (): Promise<void> => {
		const user: User = await authService.validateUser(
			userMockDataCustomer.email,
			userMockDataCustomer.password,
		);

		const passwordValid: boolean = await bcrypt.compare(
			userMockDataCustomer.password,
			user.password,
		);

		expect(isNumber(user.id)).toBe(true);
		expect(user.firstName).toBe(userMockDataCustomer.firstName);
		expect(user.lastName).toBe(userMockDataCustomer.lastName);
		expect(user.displayName).toBe(userMockDataCustomer.displayName);
		expect(passwordValid).toBe(true);
		expect(user.avatar).toBe(DEFAULT_AVATAR_NAME);
		expect(user.role).toBe(userMockDataCustomer.role);
		expect(+user.balance).toBe(0);
		expect(+user.rating).toBe(0);
		expect(user.createdAt).toBeInstanceOf(Date);
		expect(user.updatedAt).toBeInstanceOf(Date);
	});

	it('should register user', async (): Promise<void> => {
		await prisma.user.delete({ where: { email: userMockDataCustomer.email } });

		const { user, token }: { user: PublicUserDto; token: string } =
			await authService.register(userMockDataCustomer as CreateUserDto);
		const checkToken: IJwtPayload = jwtService.verify(token);

		expect(isNumber(user.id)).toBe(true);
		expect(user.displayName).toBe(userMockDataCustomer.displayName);
		expect(user.role).toBe(userMockDataCustomer.role);
		expect(user.avatar).toBe(CommonConstants.DEFAULT_AVATAR_NAME);
		expect(checkToken.user.id).toBe(user.id);
		expect(isNumber(checkToken.iat)).toBe(true);
		expect(isNumber(checkToken.exp)).toBe(true);
	});

	it('should login user', async (): Promise<void> => {
		const { user, token }: { user: PublicUserDto; token: string } =
			await authService.login({
				email: userMockDataCustomer.email,
				password: userMockDataCustomer.password,
			});

		const checkToken: IJwtPayload = jwtService.verify(token);

		expect(isNumber(user.id)).toBe(true);
		expect(user.displayName).toBe(userMockDataCustomer.displayName);
		expect(user.role).toBe(userMockDataCustomer.role);
		expect(user.avatar).toBe(CommonConstants.DEFAULT_AVATAR_NAME);
		expect(checkToken.user.id).toBe(user.id);
		expect(checkToken.user.displayName).toBe(user.displayName);
		expect(checkToken.user.role).toBe(user.role);
		expect(isNumber(checkToken.iat)).toBe(true);
		expect(isNumber(checkToken.exp)).toBe(true);
	});
});
