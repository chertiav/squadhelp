import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { isNumber } from 'class-validator';
import * as bcrypt from 'bcrypt';

import { User } from '@prisma/client';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { AppModule } from '../../src/modules/app/app.module';
import { userMockDataFirstCustomer } from '../mockData';
import { TokenService } from '../../src/modules/token/token.service';
import { IJwtPayload } from '../../src/common/interfaces/auth';
import { Tokens } from '../../src/common/interfaces/token';

describe('Token Service', (): void => {
	let app: INestApplication;
	let prisma: PrismaService;
	let tokenService: TokenService;
	let jwtService: JwtService;
	let configService: ConfigService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		app = moduleFixture.createNestApplication();
		prisma = app.get<PrismaService>(PrismaService);
		jwtService = app.get<JwtService>(JwtService);
		tokenService = app.get<TokenService>(TokenService);
		configService = app.get<ConfigService>(ConfigService);
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

	it('should generate JwtToken', async (): Promise<void> => {
		const salt: string | number = await bcrypt.genSalt();
		const hashPassword: string = await bcrypt.hash(
			userMockDataFirstCustomer.password,
			salt,
		);
		const user: User = await prisma.user.create({
			data: { ...userMockDataFirstCustomer, password: hashPassword },
		});
		const tokens: Tokens = await tokenService.generateJwtToken({
			id: user.id,
			role: user.role,
			displayName: user.displayName,
			avatar: user.avatar,
		});

		const checkAtToken: IJwtPayload = jwtService.verify(tokens.accessToken);
		const checkRtToken: IJwtPayload = jwtService.verify(tokens.refreshToken, {
			secret: configService.get<string>('secretRt'),
		});

		expect(checkAtToken.user).toEqual(checkRtToken.user);
		expect(checkAtToken.user.id).toBe(user.id);
		expect(checkAtToken.user.displayName).toBe(user.displayName);
		expect(checkAtToken.user.role).toBe(user.role);
		expect(checkAtToken.user.avatar).toBe(user.avatar);
		expect(isNumber(checkAtToken.iat)).toBe(true);
		expect(isNumber(checkAtToken.exp)).toBe(true);
	});
});
