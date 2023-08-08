import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { isNumber } from 'class-validator';
import * as bcrypt from 'bcrypt';

import { User } from '@prisma/client';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { AppModule } from '../../src/modules/app/app.module';
import { userMockData } from '../mockData';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../../src/modules/token/token.service';
import { IJwtPayload } from '../../src/common/interfaces/auth';

describe('Token Service', (): void => {
	let app: INestApplication;
	let prisma: PrismaService;
	let tokenService: TokenService;
	let jwtService: JwtService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		app = moduleFixture.createNestApplication();
		prisma = app.get<PrismaService>(PrismaService);
		jwtService = app.get<JwtService>(JwtService);
		tokenService = app.get<TokenService>(TokenService);
		await app.init();
	});

	afterEach(async (): Promise<void> => {
		await prisma.user.delete({ where: { email: userMockData.email } });
	});

	afterAll(async (): Promise<void> => {
		await prisma.$disconnect();
		await app.close();
	});

	it('should generate JwtToken', async (): Promise<void> => {
		const salt: string | number = await bcrypt.genSalt();
		const hashPassword: string = await bcrypt.hash(userMockData.password, salt);
		const user: User = await prisma.user.create({
			data: { ...userMockData, password: hashPassword },
		});
		const token: string = await tokenService.generateJwtToken({
			id: user.id,
			role: user.role,
			displayName: user.displayName,
			avatar: user.avatar,
		});

		const checkToken: IJwtPayload = jwtService.verify(token);

		expect(checkToken.user.id).toBe(user.id);
		expect(checkToken.user.displayName).toBe(user.displayName);
		expect(checkToken.user.role).toBe(user.role);
		expect(checkToken.user.avatar).toBe(user.avatar);
		expect(isNumber(checkToken.iat)).toBe(true);
		expect(isNumber(checkToken.exp)).toBe(true);
	});
});
