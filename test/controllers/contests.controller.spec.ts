import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { isArray, isObject, useContainer } from 'class-validator';
import * as bcrypt from 'bcrypt';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';

import {
	Contest,
	ContestStatus,
	ContestType,
	Industry,
	Offer,
	OfferStatus,
	StyleName,
	TypeOfName,
	TypeOfTagline,
} from '@prisma/client';
import {
	contestMockDataFirstCustomer,
	contestMockDataSecondCustomer,
	offersMockDataFirstCreator,
	offersMockDataSecondCreator,
	queryGetContestsCreatorActive,
	queryGetContestsCreatorAll,
	queryGetContestsCustomerActive,
	queryGetContestsCustomerAll,
	queryGetContestsModeratorAll,
	updateContestTypeLogo,
	updateContestTypeName,
	updateContestTypeTagLine,
	userMockDataFirstCreator,
	userMockDataFirstCustomer,
	userMockDataSecondCreator,
	userMockDataSecondCustomer,
} from '../mockData';
import { AppModule } from '../../src/modules/app/app.module';
import {
	BRAND_STYLE_API_PROPERTY_DATA_CONTEST,
	INDUSTRY_API_PROPERTY_DATA_CONTEST,
} from '../../src/common/constants/contest.constants';
import { seedUserDataModerator } from '../../prisma/seeders/data';
import { AppMessages } from '../../src/common/messages';
import { ContestDto } from '../../src/common/dto/contest';
import { ICreatContest } from '../../src/common/interfaces/contest';

describe('Contest controller', (): void => {
	let app: INestApplication;
	let prisma: PrismaService;
	let dataMockOffers: Offer[];
	let dataMockContests: { contests: ICreatContest[] };
	let userIdFirstCustomer: { id: number };
	let userIdSecondCustomer: { id: number };
	let userIdFirstCreator: { id: number };
	let userIdSecondCreator: { id: number };
	let dataIdContests: Contest[];

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
				{
					...userMockDataSecondCustomer,
					password: await hashPassword(userMockDataSecondCustomer.password),
				},
				{
					...userMockDataSecondCreator,
					password: await hashPassword(userMockDataFirstCreator.password),
				},
			],
		});

		userIdFirstCustomer = await prisma.user.findUnique({
			where: { email: userMockDataFirstCustomer.email },
			select: { id: true },
		});
		userIdSecondCustomer = await prisma.user.findUnique({
			where: { email: userMockDataSecondCustomer.email },
			select: { id: true },
		});
		userIdFirstCreator = await prisma.user.findUnique({
			where: { email: userMockDataFirstCreator.email },
			select: { id: true },
		});
		userIdSecondCreator = await prisma.user.findUnique({
			where: { email: userMockDataSecondCreator.email },
			select: { id: true },
		});

		const seedMockDataContestsFirstCustomer: ICreatContest[] =
			contestMockDataFirstCustomer.map(
				(contest: ICreatContest): ICreatContest => ({
					...contest,
					userId: userIdFirstCustomer.id,
				}),
			);

		const seedMockDataContestsSecondCustomer: ICreatContest[] =
			contestMockDataSecondCustomer.map(
				(contest: ICreatContest): ICreatContest => ({
					...contest,
					userId: userIdSecondCustomer.id,
				}),
			);

		dataMockContests = {
			contests: [
				...seedMockDataContestsFirstCustomer,
				...seedMockDataContestsSecondCustomer,
			],
		};

		await prisma.contest.createMany({
			data: dataMockContests.contests,
		});

		dataIdContests = await prisma.contest.findMany({
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

		const seedMockDataOffersSecondCreator: Offer[] =
			offersMockDataSecondCreator.map(
				(offer: Offer): Offer => ({
					...offer,
					userId: userIdSecondCreator.id,
					contestId: contestsId[randomIndex(contestsId.length)],
				}),
			);

		dataMockOffers = [
			...seedMockDataOffersFirstCreator,
			...seedMockDataOffersSecondCreator,
		];

		await prisma.offer.createMany({
			data: dataMockOffers,
		});
	});

	afterEach(async (): Promise<void> => {
		await prisma.offer.deleteMany({
			where: {},
		});
		await prisma.contest.deleteMany({
			where: {},
		});
		await prisma.user.deleteMany({
			where: {
				email: {
					in: [
						userMockDataFirstCustomer.email,
						userMockDataSecondCustomer.email,
						userMockDataFirstCreator.email,
						userMockDataSecondCreator.email,
					],
				},
			},
		});
		dataMockOffers = [];
		dataMockContests.contests = [];
		dataIdContests = [];
		userIdFirstCustomer = { id: null };
		userIdSecondCustomer = { id: null };
		userIdFirstCreator = { id: null };
		userIdSecondCreator = { id: null };
	});

	afterAll(async (): Promise<void> => {
		await prisma.$disconnect();
		await app.close();
	});

	it(`should get data for create contest ${ContestType.name}`, async (): Promise<void> => {
		const login: request.Response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: userMockDataFirstCustomer.email,
				password: userMockDataFirstCustomer.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.get(`/contest/start/${ContestType.name}`)
			.set('Cookie', login.headers['set-cookie']);

		expect(isArray(response.body.industry)).toBe(true);
		expect(isArray(response.body.typeOfName)).toBe(true);
		expect(isArray(response.body.nameStyle)).toBe(true);
		expect(response.body.industry).toEqual(INDUSTRY_API_PROPERTY_DATA_CONTEST);
		expect(response.body.typeOfName).toEqual(Object.values(TypeOfName));
		expect(response.body.nameStyle).toEqual(Object.values(StyleName));

		expect(response.status).toBe(HttpStatus.OK);
	});

	it(`should get data for create contest ${ContestType.logo}`, async (): Promise<void> => {
		const login: request.Response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: userMockDataFirstCustomer.email,
				password: userMockDataFirstCustomer.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.get(`/contest/start/${ContestType.logo}`)
			.set('Cookie', login.headers['set-cookie']);

		expect(isArray(response.body.industry)).toBe(true);
		expect(isArray(response.body.brandStyle)).toBe(true);
		expect(response.body.industry).toEqual(INDUSTRY_API_PROPERTY_DATA_CONTEST);
		expect(response.body.brandStyle).toEqual(
			BRAND_STYLE_API_PROPERTY_DATA_CONTEST,
		);

		expect(response.status).toBe(HttpStatus.OK);
	});

	it(`should get data for create contest ${ContestType.tagline}`, async (): Promise<void> => {
		const login: request.Response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: userMockDataFirstCustomer.email,
				password: userMockDataFirstCustomer.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.get(`/contest/start/${ContestType.tagline}`)
			.set('Cookie', login.headers['set-cookie']);

		expect(isArray(response.body.industry)).toBe(true);
		expect(isArray(response.body.typeOfTagline)).toBe(true);
		expect(response.body.industry).toEqual(INDUSTRY_API_PROPERTY_DATA_CONTEST);
		expect(response.body.typeOfTagline).toEqual(Object.values(TypeOfTagline));

		expect(response.status).toBe(HttpStatus.OK);
	});

	it(`should get contests for customer, status: all`, async (): Promise<void> => {
		const login: request.Response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: userMockDataSecondCustomer.email,
				password: userMockDataSecondCustomer.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.get(`/contest`)
			.set('Cookie', login.headers['set-cookie'])
			.query(queryGetContestsCustomerAll);

		const dataContests: Contest[] = dataIdContests.filter(
			(dataContest: Contest): boolean =>
				dataContest['user'].id === userIdSecondCustomer.id,
		);
		const countOffers: Offer[] = dataMockOffers.filter(
			(offer: Offer) =>
				offer.contestId === dataContests[0].id &&
				offer.status === OfferStatus.active,
		);
		const getItemResponseBodyToCheck = (itemsArray: ContestDto[]): ContestDto =>
			itemsArray.filter(
				(item: ContestDto): boolean => item.id === dataContests[0].id,
			)[0];

		expect(isArray(response.body.contests)).toBe(true);
		expect(response.body.totalCount).toBe(dataContests.length);
		expect(response.body.contests[0]).toHaveProperty('id');
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'title',
			dataContests[0].title,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'contestType',
			dataContests[0].contestType,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'typeOfName',
			dataContests[0].typeOfName,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'brandStyle',
			dataContests[0].brandStyle,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'typeOfTagline',
			dataContests[0].typeOfTagline,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'createdAt',
			dataContests[0].createdAt.toISOString(),
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'price',
			dataContests[0].price.toString(),
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'_count',
		);
		expect(
			isObject(getItemResponseBodyToCheck(response.body.contests)._count),
		).toBe(true);
		expect(
			getItemResponseBodyToCheck(response.body.contests)._count,
		).toHaveProperty('offers', countOffers.length);
		expect(response.status).toBe(HttpStatus.OK);
	});

	it(`should get contests for customer, status: active`, async (): Promise<void> => {
		const dataContests: Contest[] = dataIdContests.filter(
			(dataContest: Contest): boolean =>
				dataContest['user'].id === userIdFirstCustomer.id &&
				dataContest.status === ContestStatus.active,
		);
		const countOffers: Offer[] = dataMockOffers.filter(
			(offer: Offer) =>
				offer.contestId === dataContests[0].id &&
				offer.status === OfferStatus.active,
		);

		const login: request.Response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: userMockDataFirstCustomer.email,
				password: userMockDataFirstCustomer.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.get(`/contest`)
			.set('Cookie', login.headers['set-cookie'])
			.query(queryGetContestsCustomerActive);

		const getItemResponseBodyToCheck = (itemsArray: ContestDto[]): ContestDto =>
			itemsArray.filter(
				(item: ContestDto): boolean => item.id === dataContests[0].id,
			)[0];

		expect(isArray(response.body.contests)).toBe(true);
		expect(response.body.totalCount).toBe(dataContests.length);
		expect(response.body.contests[0]).toHaveProperty('id');
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'title',
			dataContests[0].title,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'contestType',
			dataContests[0].contestType,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'typeOfName',
			dataContests[0].typeOfName,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'brandStyle',
			dataContests[0].brandStyle,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'typeOfTagline',
			dataContests[0].typeOfTagline,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'createdAt',
			dataContests[0].createdAt.toISOString(),
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'price',
			dataContests[0].price.toString(),
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'_count',
		);
		expect(
			isObject(getItemResponseBodyToCheck(response.body.contests)._count),
		).toBe(true);
		expect(
			getItemResponseBodyToCheck(response.body.contests)._count,
		).toHaveProperty('offers', countOffers.length);
		expect(response.status).toBe(HttpStatus.OK);
	});

	it(`should get contests for creator, status: all,  industry: all, typeIndex: "name,tagline,logo"`, async (): Promise<void> => {
		const dataContests: Contest[] = dataIdContests.filter(
			(dataContest: Contest): boolean =>
				dataContest.status === ContestStatus.active ||
				dataContest.status === ContestStatus.finished,
		);
		const countOffers: Offer[] = dataMockOffers.filter(
			(offer: Offer) =>
				offer.contestId === dataContests[dataContests.length - 1].id &&
				offer.status === OfferStatus.active,
		);

		const login: request.Response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: userMockDataFirstCreator.email,
				password: userMockDataFirstCreator.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.get(`/contest`)
			.set('Cookie', login.headers['set-cookie'])
			.query(queryGetContestsCreatorAll);

		const getItemResponseBodyToCheck = (itemsArray: ContestDto[]): ContestDto =>
			itemsArray.filter(
				(item: ContestDto): boolean =>
					item.id === dataContests[dataContests.length - 1].id,
			)[0];

		expect(isArray(response.body.contests)).toBe(true);
		expect(response.body.totalCount).toBe(dataContests.length);
		expect(response.body.contests[0]).toHaveProperty('id');
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'title',
			dataContests[dataContests.length - 1].title,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'contestType',
			dataContests[dataContests.length - 1].contestType,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'typeOfName',
			dataContests[dataContests.length - 1].typeOfName,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'brandStyle',
			dataContests[dataContests.length - 1].brandStyle,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'typeOfTagline',
			dataContests[dataContests.length - 1].typeOfTagline,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'createdAt',
			dataContests[dataContests.length - 1].createdAt.toISOString(),
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'price',
			dataContests[dataContests.length - 1].price.toString(),
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'_count',
		);
		expect(
			isObject(getItemResponseBodyToCheck(response.body.contests)._count),
		).toBe(true);
		expect(
			getItemResponseBodyToCheck(response.body.contests)._count,
		).toHaveProperty('offers', countOffers.length);
		expect(response.status).toBe(HttpStatus.OK);
	});

	it(`should get contests for creator, status: active,  industry: ConsultingFirm, typeIndex: "name"`, async (): Promise<void> => {
		const dataContests: Contest[] = dataIdContests.filter(
			(dataContest: Contest): boolean =>
				dataContest.status === ContestStatus.active &&
				dataContest.industry === Industry.ConsultingFirm &&
				dataContest.contestType === ContestType.name,
		);
		const countOffers: Offer[] = dataMockOffers.filter(
			(offer: Offer): boolean =>
				offer.contestId === dataContests[dataContests.length - 1].id &&
				offer.status === OfferStatus.active,
		);

		const login: request.Response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: userMockDataFirstCreator.email,
				password: userMockDataFirstCreator.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.get(`/contest`)
			.set('Cookie', login.headers['set-cookie'])
			.query(queryGetContestsCreatorActive);

		const getItemResponseBodyToCheck = (itemsArray: ContestDto[]): ContestDto =>
			itemsArray.filter(
				(item: ContestDto): boolean =>
					item.id === dataContests[dataContests.length - 1].id,
			)[0];

		expect(isArray(response.body.contests)).toBe(true);
		expect(response.body.totalCount).toBe(dataContests.length);
		expect(response.body.contests[0]).toHaveProperty('id');
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'title',
			dataContests[dataContests.length - 1].title,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'contestType',
			dataContests[dataContests.length - 1].contestType,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'typeOfName',
			dataContests[dataContests.length - 1].typeOfName,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'brandStyle',
			dataContests[dataContests.length - 1].brandStyle,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'typeOfTagline',
			dataContests[dataContests.length - 1].typeOfTagline,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'createdAt',
			dataContests[dataContests.length - 1].createdAt.toISOString(),
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'price',
			dataContests[dataContests.length - 1].price.toString(),
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'_count',
		);
		expect(
			isObject(getItemResponseBodyToCheck(response.body.contests)._count),
		).toBe(true);
		expect(
			getItemResponseBodyToCheck(response.body.contests)._count,
		).toHaveProperty('offers', countOffers.length);
		expect(response.status).toBe(HttpStatus.OK);
	});

	it(`should get contests for moderator, industry: all, typeIndex: "name,tagline,logo"`, async (): Promise<void> => {
		const pendingOffers: number[] = dataMockOffers
			.map(
				(offer: Offer) =>
					offer.status === OfferStatus.pending && offer.contestId,
			)
			.filter(Boolean);
		const dataContests: Contest[] = dataIdContests.filter(
			(dataContest: Contest): boolean =>
				dataContest.status === ContestStatus.active &&
				pendingOffers.some(
					(contestId: number): boolean => contestId === dataContest.id,
				),
		);
		const countOffers: Offer[] = dataMockOffers.filter(
			(offer: Offer) =>
				offer.contestId === dataContests[dataContests.length - 1].id &&
				offer.status === OfferStatus.pending,
		);

		const login: request.Response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: seedUserDataModerator.email,
				password: seedUserDataModerator.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.get(`/contest`)
			.set('Cookie', login.headers['set-cookie'])
			.query(queryGetContestsModeratorAll);

		const getItemResponseBodyToCheck = (itemsArray: ContestDto[]): ContestDto =>
			itemsArray.filter(
				(item: ContestDto): boolean =>
					item.id === dataContests[dataContests.length - 1].id,
			)[0];

		expect(isArray(response.body.contests)).toBe(true);
		expect(response.body.totalCount).toBe(dataContests.length);
		expect(response.body.contests[0]).toHaveProperty('id');
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'title',
			dataContests[dataContests.length - 1].title,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'contestType',
			dataContests[dataContests.length - 1].contestType,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'typeOfName',
			dataContests[dataContests.length - 1].typeOfName,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'brandStyle',
			dataContests[dataContests.length - 1].brandStyle,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'typeOfTagline',
			dataContests[dataContests.length - 1].typeOfTagline,
		);
		expect(getItemResponseBodyToCheck(response.body.contests)).toHaveProperty(
			'_count',
		);
		expect(
			isObject(getItemResponseBodyToCheck(response.body.contests)._count),
		).toBe(true);
		expect(
			getItemResponseBodyToCheck(response.body.contests)._count,
		).toHaveProperty('offers', countOffers.length);
		expect(response.status).toBe(HttpStatus.OK);
	});

	it(`should get contests by id for customer`, async (): Promise<void> => {
		const dataContest: Contest = dataIdContests.filter(
			(dataContest: Contest): boolean =>
				dataContest['user'].id === userIdFirstCustomer.id &&
				dataContest.status === ContestStatus.active,
		)[0];
		const countOffers: Offer[] = dataMockOffers.filter(
			(offer: Offer) =>
				offer.contestId === dataContest.id &&
				offer.status === OfferStatus.active,
		);

		const login: request.Response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: userMockDataFirstCustomer.email,
				password: userMockDataFirstCustomer.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.get(`/contest/${dataContest.id}`)
			.set('Cookie', login.headers['set-cookie']);

		expect(isObject(response.body)).toBe(true);
		expect(response.body).toHaveProperty('id', dataContest.id);
		expect(response.body).toHaveProperty('title', dataContest.title);
		expect(response.body).toHaveProperty(
			'contestType',
			dataContest.contestType,
		);
		expect(response.body).toHaveProperty('typeOfName', dataContest.typeOfName);
		expect(response.body).toHaveProperty('brandStyle', dataContest.brandStyle);
		expect(response.body).toHaveProperty(
			'typeOfTagline',
			dataContest.typeOfTagline,
		);
		expect(response.body).toHaveProperty(
			'createdAt',
			dataContest.createdAt.toISOString(),
		);
		expect(response.body).toHaveProperty('price', dataContest.price.toString());
		expect(response.body).toHaveProperty('fileName', dataContest.fileName);
		expect(response.body).toHaveProperty(
			'originalFileName',
			dataContest.originalFileName,
		);
		expect(response.body).toHaveProperty(
			'focusOfWork',
			dataContest.focusOfWork,
		);
		expect(response.body).toHaveProperty('industry', dataContest.industry);

		expect(response.body).toHaveProperty(
			'nameVenture',
			dataContest.nameVenture,
		);
		expect(response.body).toHaveProperty('styleName', dataContest.styleName);
		expect(response.body).toHaveProperty(
			'targetCustomer',
			dataContest.targetCustomer,
		);
		expect(response.body).toHaveProperty('_count');
		expect(isObject(response.body._count)).toBe(true);
		expect(response.body._count).toHaveProperty('offers', countOffers.length);
		expect(response.status).toBe(HttpStatus.OK);
	});

	it(`should get contests by id for creator`, async (): Promise<void> => {
		const dataContest: Contest = dataIdContests.filter(
			(dataContest: Contest): boolean =>
				dataContest.status === ContestStatus.active,
		)[0];
		const countOffers: Offer[] = dataMockOffers.filter(
			(offer: Offer) =>
				offer.contestId === dataContest.id &&
				offer.status === OfferStatus.active,
		);

		const login: request.Response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: userMockDataFirstCreator.email,
				password: userMockDataFirstCreator.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.get(`/contest/${dataContest.id}`)
			.set('Cookie', login.headers['set-cookie']);

		expect(isObject(response.body)).toBe(true);
		expect(response.body).toHaveProperty('id', dataContest.id);
		expect(response.body).toHaveProperty('title', dataContest.title);
		expect(response.body).toHaveProperty(
			'contestType',
			dataContest.contestType,
		);
		expect(response.body).toHaveProperty('typeOfName', dataContest.typeOfName);
		expect(response.body).toHaveProperty('brandStyle', dataContest.brandStyle);
		expect(response.body).toHaveProperty(
			'typeOfTagline',
			dataContest.typeOfTagline,
		);
		expect(response.body).toHaveProperty(
			'createdAt',
			dataContest.createdAt.toISOString(),
		);
		expect(response.body).toHaveProperty('price', dataContest.price.toString());
		expect(response.body).toHaveProperty('fileName', dataContest.fileName);
		expect(response.body).toHaveProperty(
			'originalFileName',
			dataContest.originalFileName,
		);
		expect(response.body).toHaveProperty(
			'focusOfWork',
			dataContest.focusOfWork,
		);
		expect(response.body).toHaveProperty('industry', dataContest.industry);

		expect(response.body).toHaveProperty(
			'nameVenture',
			dataContest.nameVenture,
		);
		expect(response.body).toHaveProperty('styleName', dataContest.styleName);
		expect(response.body).toHaveProperty(
			'targetCustomer',
			dataContest.targetCustomer,
		);
		expect(response.body).toHaveProperty('user');
		expect(isObject(response.body.user)).toBe(true);
		expect(response.body.user).toHaveProperty(
			'firstName',
			dataContest['user'].firstName,
		);
		expect(response.body.user).toHaveProperty(
			'lastName',
			dataContest['user'].lastName,
		);
		expect(response.body.user).toHaveProperty(
			'displayName',
			dataContest['user'].displayName,
		);
		expect(response.body.user).toHaveProperty(
			'avatar',
			dataContest['user'].avatar,
		);
		expect(response.body).toHaveProperty('_count');
		expect(isObject(response.body._count)).toBe(true);
		expect(response.body._count).toHaveProperty('offers', countOffers.length);
		expect(response.status).toBe(HttpStatus.OK);
	});

	it(`should get contests by id for moderator`, async (): Promise<void> => {
		const pendingOffers: number[] = dataMockOffers
			.map(
				(offer: Offer) =>
					offer.status === OfferStatus.pending && offer.contestId,
			)
			.filter(Boolean);
		const dataContest: Contest = dataIdContests.filter(
			(dataContest: Contest): boolean =>
				dataContest.status === ContestStatus.active &&
				pendingOffers.some(
					(contestId: number): boolean => contestId === dataContest.id,
				),
		)[0];
		const countOffers: Offer[] = dataMockOffers.filter(
			(offer: Offer) =>
				offer.contestId === dataContest.id &&
				offer.status === OfferStatus.pending,
		);

		const login: request.Response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: seedUserDataModerator.email,
				password: seedUserDataModerator.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.get(`/contest/${dataContest.id}`)
			.set('Cookie', login.headers['set-cookie']);

		expect(isObject(response.body)).toBe(true);
		expect(response.body).toHaveProperty('id', dataContest.id);
		expect(response.body).toHaveProperty('title', dataContest.title);
		expect(response.body).toHaveProperty(
			'contestType',
			dataContest.contestType,
		);
		expect(response.body).toHaveProperty('typeOfName', dataContest.typeOfName);
		expect(response.body).toHaveProperty('brandStyle', dataContest.brandStyle);
		expect(response.body).toHaveProperty(
			'typeOfTagline',
			dataContest.typeOfTagline,
		);
		expect(response.body).toHaveProperty(
			'createdAt',
			dataContest.createdAt.toISOString(),
		);
		expect(response.body).toHaveProperty('fileName', dataContest.fileName);
		expect(response.body).toHaveProperty(
			'originalFileName',
			dataContest.originalFileName,
		);
		expect(response.body).toHaveProperty(
			'focusOfWork',
			dataContest.focusOfWork,
		);
		expect(response.body).toHaveProperty('industry', dataContest.industry);
		expect(response.body).toHaveProperty(
			'nameVenture',
			dataContest.nameVenture,
		);
		expect(response.body).toHaveProperty('styleName', dataContest.styleName);
		expect(response.body).toHaveProperty(
			'targetCustomer',
			dataContest.targetCustomer,
		);
		expect(isObject(response.body._count)).toBe(true);
		expect(response.body._count).toHaveProperty('offers', countOffers.length);
		expect(response.status).toBe(HttpStatus.OK);
	});

	it(`should update contest, type: ${ContestType.name}`, async (): Promise<void> => {
		const dataContest: Contest = dataIdContests.filter(
			(dataContest: Contest): boolean =>
				dataContest['user'].id === userIdFirstCustomer.id &&
				dataContest.status !== ContestStatus.finished &&
				dataContest.contestType === ContestType.name,
		)[0];
		const countOffers: Offer[] = dataMockOffers.filter(
			(offer: Offer) =>
				offer.contestId === dataContest.id &&
				offer.status === OfferStatus.active,
		);

		const login: request.Response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: userMockDataFirstCustomer.email,
				password: userMockDataFirstCustomer.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.patch(`/contest/update/${dataContest.id}`)
			.set('Cookie', login.headers['set-cookie'])
			.send(updateContestTypeName);

		expect(isObject(response.body)).toBe(true);
		expect(response.body.contest).toHaveProperty('id', dataContest.id);
		expect(response.body.contest).toHaveProperty(
			'title',
			updateContestTypeName.title,
		);
		expect(response.body.contest).toHaveProperty(
			'contestType',
			dataContest.contestType,
		);
		expect(response.body.contest).toHaveProperty(
			'typeOfName',
			updateContestTypeName.typeOfName,
		);
		expect(response.body.contest).toHaveProperty(
			'brandStyle',
			dataContest.brandStyle,
		);
		expect(response.body.contest).toHaveProperty(
			'typeOfTagline',
			dataContest.typeOfTagline,
		);
		expect(response.body.contest).toHaveProperty(
			'createdAt',
			dataContest.createdAt.toISOString(),
		);
		expect(response.body.contest).toHaveProperty(
			'price',
			dataContest.price.toString(),
		);
		expect(response.body.contest).toHaveProperty(
			'fileName',
			dataContest.fileName,
		);
		expect(response.body.contest).toHaveProperty(
			'originalFileName',
			dataContest.originalFileName,
		);
		expect(response.body.contest).toHaveProperty(
			'focusOfWork',
			updateContestTypeName.focusOfWork,
		);
		expect(response.body.contest).toHaveProperty(
			'industry',
			updateContestTypeName.industry,
		);

		expect(response.body.contest).toHaveProperty(
			'nameVenture',
			dataContest.nameVenture,
		);
		expect(response.body.contest).toHaveProperty(
			'styleName',
			updateContestTypeName.styleName,
		);
		expect(response.body.contest).toHaveProperty(
			'targetCustomer',
			updateContestTypeName.targetCustomer,
		);
		expect(response.body.contest).toHaveProperty('_count');
		expect(isObject(response.body.contest._count)).toBe(true);
		expect(response.body.contest._count).toHaveProperty(
			'offers',
			countOffers.length,
		);
		expect(response.body).toHaveProperty(
			'message',
			AppMessages.MSG_CONTEST_INFORMATION_UPDATED,
		);
		expect(response.status).toBe(HttpStatus.OK);
	});

	it(`should update contest, type: ${ContestType.tagline}`, async (): Promise<void> => {
		const dataContest: Contest = dataIdContests.filter(
			(dataContest: Contest): boolean =>
				dataContest['user'].id === userIdFirstCustomer.id &&
				dataContest.status !== ContestStatus.finished &&
				dataContest.contestType === ContestType.tagline,
		)[0];
		const countOffers: Offer[] = dataMockOffers.filter(
			(offer: Offer) =>
				offer.contestId === dataContest.id &&
				offer.status === OfferStatus.active,
		);

		const login: request.Response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: userMockDataFirstCustomer.email,
				password: userMockDataFirstCustomer.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.patch(`/contest/update/${dataContest.id}`)
			.set('Cookie', login.headers['set-cookie'])
			.send(updateContestTypeTagLine);

		expect(isObject(response.body)).toBe(true);
		expect(response.body.contest).toHaveProperty('id', dataContest.id);
		expect(response.body.contest).toHaveProperty(
			'title',
			updateContestTypeTagLine.title,
		);
		expect(response.body.contest).toHaveProperty(
			'contestType',
			dataContest.contestType,
		);
		expect(response.body.contest).toHaveProperty(
			'typeOfName',
			dataContest.typeOfName,
		);
		expect(response.body.contest).toHaveProperty(
			'brandStyle',
			dataContest.brandStyle,
		);
		expect(response.body.contest).toHaveProperty(
			'typeOfTagline',
			updateContestTypeTagLine.typeOfTagline,
		);
		expect(response.body.contest).toHaveProperty(
			'createdAt',
			dataContest.createdAt.toISOString(),
		);
		expect(response.body.contest).toHaveProperty(
			'price',
			dataContest.price.toString(),
		);
		expect(response.body.contest).toHaveProperty(
			'fileName',
			dataContest.fileName,
		);
		expect(response.body.contest).toHaveProperty(
			'originalFileName',
			dataContest.originalFileName,
		);
		expect(response.body.contest).toHaveProperty(
			'focusOfWork',
			updateContestTypeTagLine.focusOfWork,
		);
		expect(response.body.contest).toHaveProperty(
			'industry',
			updateContestTypeTagLine.industry,
		);

		expect(response.body.contest).toHaveProperty(
			'nameVenture',
			updateContestTypeTagLine.nameVenture,
		);
		expect(response.body.contest).toHaveProperty(
			'styleName',
			dataContest.styleName,
		);
		expect(response.body.contest).toHaveProperty(
			'targetCustomer',
			updateContestTypeTagLine.targetCustomer,
		);
		expect(response.body.contest).toHaveProperty('_count');
		expect(isObject(response.body.contest._count)).toBe(true);
		expect(response.body.contest._count).toHaveProperty(
			'offers',
			countOffers.length,
		);
		expect(response.body).toHaveProperty(
			'message',
			AppMessages.MSG_CONTEST_INFORMATION_UPDATED,
		);
		expect(response.status).toBe(HttpStatus.OK);
	});

	it(`should update contest, type: ${ContestType.logo}`, async (): Promise<void> => {
		const dataContest: Contest = dataIdContests.filter(
			(dataContest: Contest): boolean =>
				dataContest['user'].id === userIdSecondCustomer.id &&
				dataContest.status !== ContestStatus.finished &&
				dataContest.contestType === ContestType.logo,
		)[0];
		const countOffers: Offer[] = dataMockOffers.filter(
			(offer: Offer) =>
				offer.contestId === dataContest.id &&
				offer.status === OfferStatus.active,
		);

		const login: request.Response = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: userMockDataSecondCustomer.email,
				password: userMockDataSecondCustomer.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.patch(`/contest/update/${dataContest.id}`)
			.set('Cookie', login.headers['set-cookie'])
			.send(updateContestTypeLogo);

		expect(isObject(response.body)).toBe(true);
		expect(response.body.contest).toHaveProperty('id', dataContest.id);
		expect(response.body.contest).toHaveProperty(
			'title',
			updateContestTypeLogo.title,
		);
		expect(response.body.contest).toHaveProperty(
			'contestType',
			dataContest.contestType,
		);
		expect(response.body.contest).toHaveProperty(
			'typeOfName',
			dataContest.typeOfName,
		);
		expect(response.body.contest).toHaveProperty(
			'brandStyle',
			updateContestTypeLogo.brandStyle,
		);
		expect(response.body.contest).toHaveProperty(
			'typeOfTagline',
			dataContest.typeOfTagline,
		);
		expect(response.body.contest).toHaveProperty(
			'createdAt',
			dataContest.createdAt.toISOString(),
		);
		expect(response.body.contest).toHaveProperty(
			'price',
			dataContest.price.toString(),
		);
		expect(response.body.contest).toHaveProperty(
			'fileName',
			dataContest.fileName,
		);
		expect(response.body.contest).toHaveProperty(
			'originalFileName',
			dataContest.originalFileName,
		);
		expect(response.body.contest).toHaveProperty(
			'focusOfWork',
			updateContestTypeLogo.focusOfWork,
		);
		expect(response.body.contest).toHaveProperty(
			'industry',
			updateContestTypeLogo.industry,
		);

		expect(response.body.contest).toHaveProperty(
			'nameVenture',
			updateContestTypeLogo.nameVenture,
		);
		expect(response.body.contest).toHaveProperty(
			'styleName',
			dataContest.styleName,
		);
		expect(response.body.contest).toHaveProperty(
			'targetCustomer',
			updateContestTypeLogo.targetCustomer,
		);
		expect(response.body.contest).toHaveProperty('_count');
		expect(isObject(response.body.contest._count)).toBe(true);
		expect(response.body.contest._count).toHaveProperty(
			'offers',
			countOffers.length,
		);
		expect(response.body).toHaveProperty(
			'message',
			AppMessages.MSG_CONTEST_INFORMATION_UPDATED,
		);
		expect(response.status).toBe(HttpStatus.OK);
	});
});
