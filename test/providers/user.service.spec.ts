import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { isNumber } from 'class-validator';
import * as bcrypt from 'bcrypt';

import { User } from '@prisma/client';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { AppModule } from '../../src/modules/app/app.module';
import {
	userMockDataCreator,
	userMockDataCustomer,
	userUpdateMockData,
} from '../mockData';
import { UserService } from '../../src/modules/user/user.service';
import { DEFAULT_AVATAR_NAME } from '../../src/common/constants/common.constants';
import {
	BalanceUserDto,
	InfoUserDto,
	PublicUserDto,
} from '../../src/common/dto/user';

describe('User Service', (): void => {
	let app: INestApplication;
	let prisma: PrismaService;
	let userService: UserService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		app = moduleFixture.createNestApplication();
		prisma = app.get<PrismaService>(PrismaService);
		userService = app.get<UserService>(UserService);
		await app.init();
	});

	beforeEach(async (): Promise<void> => {
		const hashPassword = async (password: string): Promise<string> => {
			const salt: number | string = await bcrypt.genSalt();
			return bcrypt.hash(password, salt);
		};
		await prisma.user.create({
			data: {
				...userMockDataCustomer,
				password: await hashPassword(userMockDataCustomer.password),
			},
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

	it('should find one user', async (): Promise<void> => {
		const findUser: User = await userService.findOne({
			where: { email: userMockDataCustomer.email },
		});
		const passwordValid: boolean = await bcrypt.compare(
			userMockDataCustomer.password,
			findUser.password,
		);

		expect(findUser).toMatchObject(findUser);
		expect(isNumber(findUser.id)).toBe(true);
		expect(findUser.firstName).toBe(userMockDataCustomer.firstName);
		expect(findUser.lastName).toBe(userMockDataCustomer.lastName);
		expect(findUser.displayName).toBe(userMockDataCustomer.displayName);
		expect(passwordValid).toBe(true);
		expect(findUser.email).toBe(userMockDataCustomer.email);
		expect(findUser.avatar).toBe(DEFAULT_AVATAR_NAME);
		expect(findUser.role).toBe(userMockDataCustomer.role);
		expect(+findUser.balance).toBe(0);
		expect(+findUser.rating).toBe(0);
		expect(findUser.createdAt).toBeInstanceOf(Date);
		expect(findUser.updatedAt).toBeInstanceOf(Date);
	});

	it('should create user', async (): Promise<void> => {
		await prisma.user.delete({ where: { email: userMockDataCustomer.email } });
		const user: PublicUserDto = await userService.createUser(
			userMockDataCustomer,
		);
		expect(user).toMatchObject(user);
		expect(isNumber(user.id)).toBe(true);
		expect(user.displayName).toBe(userMockDataCustomer.displayName);
		expect(user.role).toBe(userMockDataCustomer.role);
		expect(user.avatar).toBe(DEFAULT_AVATAR_NAME);
	});

	it('should get user public data', async (): Promise<void> => {
		const user: PublicUserDto = await userService.getPublicUser(
			userMockDataCustomer.email,
		);
		expect(user).toMatchObject(user);
		expect(isNumber(user.id)).toBe(true);
		expect(user.displayName).toBe(userMockDataCustomer.displayName);
		expect(user.role).toBe(userMockDataCustomer.role);
		expect(user.avatar).toBe(DEFAULT_AVATAR_NAME);
	});

	it('should get info  user', async (): Promise<void> => {
		await prisma.user.delete({ where: { email: userMockDataCustomer.email } });
		const user: PublicUserDto = await userService.createUser(
			userMockDataCustomer,
		);
		const infoDataUser: InfoUserDto = await userService.getInfoUser(user.id);
		expect(infoDataUser).toMatchObject(infoDataUser);
		expect(isNumber(infoDataUser.id)).toBe(true);
		expect(infoDataUser.displayName).toBe(userMockDataCustomer.displayName);
		expect(infoDataUser.role).toBe(userMockDataCustomer.role);
		expect(infoDataUser.avatar).toBe(DEFAULT_AVATAR_NAME);
		expect(infoDataUser.firstName).toBe(userMockDataCustomer.firstName);
		expect(infoDataUser.lastName).toBe(userMockDataCustomer.lastName);
		expect(infoDataUser.email).toBe(userMockDataCustomer.email);
	});

	it('should update info  user', async (): Promise<void> => {
		await prisma.user.delete({ where: { email: userMockDataCustomer.email } });
		const user: PublicUserDto = await userService.createUser(
			userMockDataCustomer,
		);
		const updateUser: InfoUserDto = await userService.updateInfoUser(
			userUpdateMockData,
			user.id,
		);
		expect(updateUser).toMatchObject(updateUser);
		expect(isNumber(updateUser.id)).toBe(true);
		expect(updateUser.displayName).toBe(userUpdateMockData.displayName);
		expect(updateUser.role).toBe(userMockDataCustomer.role);
		expect(updateUser.avatar).toBe(DEFAULT_AVATAR_NAME);
		expect(updateUser.firstName).toBe(userUpdateMockData.firstName);
		expect(updateUser.lastName).toBe(userUpdateMockData.lastName);
		expect(updateUser.email).toBe(userMockDataCustomer.email);
	});

	it('should get balance user', async (): Promise<void> => {
		const user: PublicUserDto = await userService.createUser(
			userMockDataCreator,
		);
		const balanceUser: BalanceUserDto = await userService.getBalanceUser(
			user.id,
		);
		expect(balanceUser).toMatchObject(balanceUser);
		expect(+balanceUser.balance).toBe(0);
	});
});
