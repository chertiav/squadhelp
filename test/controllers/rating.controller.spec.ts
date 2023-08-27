import {
	HttpStatus,
	INestApplication,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import * as bcrypt from 'bcrypt';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';

import { Contest, Offer, OfferStatus } from '@prisma/client';
import {
	contestMockDataFirstCustomer,
	offersMockDataFirstCreator,
	userMockDataFirstCreator,
	userMockDataFirstCustomer,
} from '../mockData';
import { AppModule } from '../../src/modules/app/app.module';
import { ICreatContest } from '../../src/common/interfaces/contest';
import { ChangeRatingDto } from '../../src/common/dto/rating';
import { AppMessages } from '../../src/common/messages';

describe('Contest controller', (): void => {
	let app: INestApplication;
	let prisma: PrismaService;
	let userIdFirstCustomer: { id: number };
	let userIdFirstCreator: { id: number };
	let dataMockContests: { contests: ICreatContest[] };

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

	beforeEach(async (): Promise<void> => {
		const hashPassword = async (password: string): Promise<string> => {
			const salt: number | string = await bcrypt.genSalt();
			return bcrypt.hash(password, salt);
		};

		await prisma.user.createMany({
			data: [
				{
					...userMockDataFirstCustomer,
					password: await hashPassword(userMockDataFirstCustomer.password),
				},
				{
					...userMockDataFirstCreator,
					password: await hashPassword(userMockDataFirstCreator.password),
				},
			],
		});

		userIdFirstCustomer = await prisma.user.findUnique({
			where: { email: userMockDataFirstCustomer.email },
			select: { id: true },
		});
		userIdFirstCreator = await prisma.user.findUnique({
			where: { email: userMockDataFirstCreator.email },
			select: { id: true },
		});

		const seedMockDataContestsFirstCustomer: ICreatContest[] =
			contestMockDataFirstCustomer.map(
				(contest: ICreatContest): ICreatContest => ({
					...contest,
					userId: userIdFirstCustomer.id,
				}),
			);

		dataMockContests = {
			contests: [...seedMockDataContestsFirstCustomer],
		};

		await prisma.contest.createMany({
			data: dataMockContests.contests,
		});

		const dataIdContests: Contest[] = await prisma.contest.findMany({
			where: {},
			include: {
				user: true,
			},
		});
		const contestsId: number[] = dataIdContests.map(
			(contestId: { id: number }) => +contestId.id,
		);
		const randomIndex = (length: number): number =>
			Math.floor(Math.random() * (length - 1));

		const seedMockDataOffersFirstCreator: Offer[] =
			offersMockDataFirstCreator.map(
				(offer: Offer): Offer => ({
					...offer,
					userId: userIdFirstCreator.id,
					contestId: contestsId[randomIndex(contestsId.length)],
				}),
			);

		await prisma.offer.createMany({
			data: seedMockDataOffersFirstCreator,
		});
	});

	afterEach(async (): Promise<void> => {
		await prisma.rating.deleteMany({
			where: {},
		});
		await prisma.offer.deleteMany({
			where: {},
		});
		await prisma.contest.deleteMany({
			where: {},
		});
		await prisma.user.deleteMany({
			where: {
				email: {
					in: [userMockDataFirstCustomer.email, userMockDataFirstCreator.email],
				},
			},
		});
		dataMockContests.contests = [];
		userIdFirstCustomer = { id: null };
		userIdFirstCreator = { id: null };
	});

	afterAll(async (): Promise<void> => {
		await prisma.$disconnect();
		await app.close();
	});

	it(`should change offer rating, first grade mark `, async (): Promise<void> => {
		const dataOfferId: { id: number; offers: { id: number }[] }[] =
			await prisma.contest.findMany({
				where: { offers: { some: { status: OfferStatus.active } } },
				select: { id: true, offers: { select: { id: true } } },
			});

		const login: request.Response = await request(app.getHttpServer())
			.post('/v1/auth/login')
			.send({
				email: userMockDataFirstCustomer.email,
				password: userMockDataFirstCustomer.password,
			});

		const dataRating: ChangeRatingDto = {
			offerId: dataOfferId[0].offers[0].id.toString(),
			creatorId: userIdFirstCreator.id.toString(),
			mark: 1.5,
			isFirst: true,
		};

		const response: request.Response = await request(app.getHttpServer())
			.patch(`/v1/rating/change`)
			.set('Cookie', login.headers['set-cookie'])
			.send(dataRating);

		expect(response.body).toHaveProperty('ratingData');
		expect(response.body.ratingData).toHaveProperty(
			'userId',
			userIdFirstCreator.id,
		);
		expect(response.body.ratingData).toHaveProperty('rating', dataRating.mark);
		expect(response.body).toHaveProperty(
			'message',
			AppMessages.MSG_RATING_CHANGE,
		);
		expect(response.status).toBe(HttpStatus.OK);
	});

	it(`should change offer rating, subsequent evaluations `, async (): Promise<void> => {
		const dataOfferId: { id: number; offers: { id: number }[] }[] =
			await prisma.contest.findMany({
				where: { offers: { some: { status: OfferStatus.active } } },
				select: { id: true, offers: { select: { id: true } } },
			});

		await prisma.rating.create({
			data: {
				offerId: dataOfferId[0].offers[0].id,
				userId: userIdFirstCustomer.id,
				mark: 1,
			},
		});

		const dataUpdateRating: ChangeRatingDto = {
			offerId: dataOfferId[0].offers[0].id.toString(),
			creatorId: userIdFirstCreator.id.toString(),
			mark: 1.5,
			isFirst: false,
		};

		const login: request.Response = await request(app.getHttpServer())
			.post('/v1/auth/login')
			.send({
				email: userMockDataFirstCustomer.email,
				password: userMockDataFirstCustomer.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.patch(`/v1/rating/change`)
			.set('Cookie', login.headers['set-cookie'])
			.send(dataUpdateRating);

		expect(response.body).toHaveProperty('ratingData');
		expect(response.body.ratingData).toHaveProperty(
			'userId',
			userIdFirstCreator.id,
		);
		expect(response.body.ratingData).toHaveProperty(
			'rating',
			dataUpdateRating.mark,
		);
		expect(response.body).toHaveProperty(
			'message',
			AppMessages.MSG_RATING_CHANGE,
		);
		expect(response.status).toBe(HttpStatus.OK);
	});
});
