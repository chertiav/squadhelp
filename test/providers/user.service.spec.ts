import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { isNumber } from 'class-validator';
import * as bcrypt from 'bcrypt';

import { User } from '@prisma/client';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { AppModule } from '../../src/modules/app/app.module';
import {
	userMockDataFirstCreator,
	userMockDataFirstCustomer,
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
				...userMockDataFirstCustomer,
				password: await hashPassword(userMockDataFirstCustomer.password),
			},
		});
	});

	afterEach(async (): Promise<void> => {
		await prisma.user.deleteMany({
			where: {
				email: {
					in: [userMockDataFirstCustomer.email, userMockDataFirstCreator.email],
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
			where: { email: userMockDataFirstCustomer.email },
		});
		const passwordValid: boolean = await bcrypt.compare(
			userMockDataFirstCustomer.password,
			findUser.password,
		);

		expect(findUser).toMatchObject(findUser);
		expect(isNumber(findUser.id)).toBe(true);
		expect(findUser.firstName).toBe(userMockDataFirstCustomer.firstName);
		expect(findUser.lastName).toBe(userMockDataFirstCustomer.lastName);
		expect(findUser.displayName).toBe(userMockDataFirstCustomer.displayName);
		expect(passwordValid).toBe(true);
		expect(findUser.email).toBe(userMockDataFirstCustomer.email);
		expect(findUser.avatar).toBe(DEFAULT_AVATAR_NAME);
		expect(findUser.role).toBe(userMockDataFirstCustomer.role);
		expect(+findUser.balance).toBe(0);
		expect(+findUser.rating).toBe(0);
		expect(findUser.createdAt).toBeInstanceOf(Date);
		expect(findUser.updatedAt).toBeInstanceOf(Date);
	});

	it('should create user', async (): Promise<void> => {
		await prisma.user.delete({
			where: { email: userMockDataFirstCustomer.email },
		});
		const user: PublicUserDto = await userService.createUser(
			userMockDataFirstCustomer,
		);
		expect(user).toMatchObject(user);
		expect(isNumber(user.id)).toBe(true);
		expect(user.displayName).toBe(userMockDataFirstCustomer.displayName);
		expect(user.role).toBe(userMockDataFirstCustomer.role);
		expect(user.avatar).toBe(DEFAULT_AVATAR_NAME);
	});

	it('should get user public data', async (): Promise<void> => {
		const user: PublicUserDto = await userService.getPublicUser(
			userMockDataFirstCustomer.email,
		);
		expect(user).toMatchObject(user);
		expect(isNumber(user.id)).toBe(true);
		expect(user.displayName).toBe(userMockDataFirstCustomer.displayName);
		expect(user.role).toBe(userMockDataFirstCustomer.role);
		expect(user.avatar).toBe(DEFAULT_AVATAR_NAME);
	});

	it('should get info  user', async (): Promise<void> => {
		await prisma.user.delete({
			where: { email: userMockDataFirstCustomer.email },
		});
		const user: PublicUserDto = await userService.createUser(
			userMockDataFirstCustomer,
		);
		const infoDataUser: InfoUserDto = await userService.getInfoUser(user.id);
		expect(infoDataUser).toMatchObject(infoDataUser);
		expect(isNumber(infoDataUser.id)).toBe(true);
		expect(infoDataUser.displayName).toBe(
			userMockDataFirstCustomer.displayName,
		);
		expect(infoDataUser.role).toBe(userMockDataFirstCustomer.role);
		expect(infoDataUser.avatar).toBe(DEFAULT_AVATAR_NAME);
		expect(infoDataUser.firstName).toBe(userMockDataFirstCustomer.firstName);
		expect(infoDataUser.lastName).toBe(userMockDataFirstCustomer.lastName);
		expect(infoDataUser.email).toBe(userMockDataFirstCustomer.email);
	});

	it('should update info  user', async (): Promise<void> => {
		await prisma.user.delete({
			where: { email: userMockDataFirstCustomer.email },
		});
		const user: PublicUserDto = await userService.createUser(
			userMockDataFirstCustomer,
		);
		const updateUser: InfoUserDto = await userService.updateInfoUser(
			userUpdateMockData,
			user.id,
		);
		expect(updateUser).toMatchObject(updateUser);
		expect(isNumber(updateUser.id)).toBe(true);
		expect(updateUser.displayName).toBe(userUpdateMockData.displayName);
		expect(updateUser.role).toBe(userMockDataFirstCustomer.role);
		expect(updateUser.avatar).toBe(DEFAULT_AVATAR_NAME);
		expect(updateUser.firstName).toBe(userUpdateMockData.firstName);
		expect(updateUser.lastName).toBe(userUpdateMockData.lastName);
		expect(updateUser.email).toBe(userMockDataFirstCustomer.email);
	});

	it('should get balance user', async (): Promise<void> => {
		const user: PublicUserDto = await userService.createUser(
			userMockDataFirstCreator,
		);
		const balanceUser: BalanceUserDto = await userService.getBalanceUser(
			user.id,
		);
		expect(balanceUser).toMatchObject(balanceUser);
		expect(+balanceUser.balance).toBe(0);
	});
});
