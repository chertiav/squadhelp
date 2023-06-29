import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { isNumber } from 'class-validator';
import * as bcrypt from 'bcrypt';

import { User } from '@prisma/client';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { AuthService } from '../../src/modules/auth/auth.service';
import { AppModule } from '../../src/modules/app/app.module';
import { userMockData } from '../mockData';
import { CreateUserDto, PublicUserDto } from '../../src/common/dto/user';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from '../../src/common/interfaces/auth';

describe('Auth Service', () => {
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

	beforeEach(async () => {
		const salt: string | number = await bcrypt.genSalt();
		const hashPassword: string = await bcrypt.hash(userMockData.password, salt);
		await prisma.user.create({
			data: { ...userMockData, password: hashPassword },
		});
	});

	afterEach(async (): Promise<void> => {
		await prisma.user.delete({ where: { email: userMockData.email } });
	});

	afterAll(async (): Promise<void> => {
		await prisma.$disconnect();
	});

	it('should validate user', async (): Promise<void> => {
		const user: User = await authService.validateUser(
			userMockData.email,
			userMockData.password,
		);

		const passwordValid: boolean = await bcrypt.compare(
			userMockData.password,
			user.password,
		);

		expect(isNumber(user.id)).toBe(true);
		expect(user.firstName).toBe(userMockData.firstName);
		expect(user.lastName).toBe(userMockData.lastName);
		expect(user.displayName).toBe(userMockData.displayName);
		expect(passwordValid).toBe(true);
		expect(user.avatar).toBe('anon.png');
		expect(user.role).toBe(userMockData.role);
		expect(+user.balance).toBe(0);
		expect(+user.rating).toBe(0);
		expect(user.createdAt).toBeInstanceOf(Date);
		expect(user.updatedAt).toBeInstanceOf(Date);
	});

	it('should register user', async (): Promise<void> => {
		await prisma.user.delete({ where: { email: userMockData.email } });

		const { user, token }: { user: PublicUserDto; token: string } =
			await authService.register(userMockData as CreateUserDto);
		const checkToken: IJwtPayload = jwtService.verify(token);

		expect(isNumber(user.id)).toBe(true);
		expect(user.displayName).toBe(userMockData.displayName);
		expect(user.role).toBe(userMockData.role);
		expect(checkToken.user.id).toBe(user.id);
		expect(user.displayName).toBe(user.displayName);
		expect(user.role).toBe(user.role);
		expect(isNumber(checkToken.iat)).toBe(true);
		expect(isNumber(checkToken.exp)).toBe(true);
	});

	it('should login user', async (): Promise<void> => {
		const { user, token }: { user: PublicUserDto; token: string } =
			await authService.login({
				email: userMockData.email,
				password: userMockData.password,
			});

		const checkToken: IJwtPayload = jwtService.verify(token);

		expect(isNumber(user.id)).toBe(true);
		expect(user.displayName).toBe(userMockData.displayName);
		expect(user.role).toBe(userMockData.role);
		expect(checkToken.user.id).toBe(user.id);
		expect(checkToken.user.displayName).toBe(user.displayName);
		expect(checkToken.user.role).toBe(user.role);
		expect(isNumber(checkToken.iat)).toBe(true);
		expect(isNumber(checkToken.exp)).toBe(true);
	});
});
