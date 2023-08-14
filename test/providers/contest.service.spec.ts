import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { isArray, isObject } from 'class-validator';

import {
	Contest,
	ContestStatus,
	ContestType,
	Industry,
	Offer,
	OfferStatus,
	Role,
	StyleName,
	TypeOfName,
	TypeOfTagline,
} from '@prisma/client';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { ContestService } from '../../src/modules/contest/contest.service';
import { AppModule } from '../../src/modules/app/app.module';
import {
	BRAND_STYLE_API_PROPERTY_DATA_CONTEST,
	INDUSTRY_API_PROPERTY_DATA_CONTEST,
} from '../../src/common/constants/contest.constants';
import {
	ContestDto,
	CreatorContestByIdResDto,
	CreatorContestsResDto,
	CustomerContestByIdResDto,
	CustomerContestsResDto,
	LogoDataContestResDto,
	ModeratorContestByIdResDto,
	ModeratorContestResDto,
	NameDataContestResDto,
	TaglineDataContestResDto,
} from '../../src/common/dto/contest';
import * as bcrypt from 'bcrypt';
import {
	contestMockDataFirstCustomer,
	contestMockDataSecondCustomer,
	createOneContest,
	createThreeContests,
	createTwoContests,
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
import { ICreatContest } from '../../src/common/interfaces/contest';

describe('Contest service', (): void => {
	let app: INestApplication;
	let prisma: PrismaService;
	let contestService: ContestService;
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
		contestService = app.get<ContestService>(ContestService);
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
		const response: NameDataContestResDto =
			await contestService.getDataNewContest(ContestType.name);

		expect(isArray(response.industry)).toBe(true);
		expect(isArray(response.typeOfName)).toBe(true);
		expect(isArray(response.nameStyle)).toBe(true);
		expect(response.industry).toEqual(INDUSTRY_API_PROPERTY_DATA_CONTEST);
		expect(response.typeOfName).toEqual(Object.values(TypeOfName));
		expect(response.nameStyle).toEqual(Object.values(StyleName));
	});

	it(`should get data for create contest ${ContestType.logo}`, async (): Promise<void> => {
		const response: LogoDataContestResDto =
			await contestService.getDataNewContest(ContestType.logo);

		expect(isArray(response.industry)).toBe(true);
		expect(isArray(response.brandStyle)).toBe(true);
		expect(response.industry).toEqual(INDUSTRY_API_PROPERTY_DATA_CONTEST);
		expect(response.brandStyle).toEqual(BRAND_STYLE_API_PROPERTY_DATA_CONTEST);
	});

	it(`should get data for create contest ${ContestType.tagline}`, async (): Promise<void> => {
		const response: TaglineDataContestResDto =
			await contestService.getDataNewContest(ContestType.tagline);

		expect(isArray(response.industry)).toBe(true);
		expect(isArray(response.typeOfTagline)).toBe(true);
		expect(response.industry).toEqual(INDUSTRY_API_PROPERTY_DATA_CONTEST);
		expect(response.typeOfTagline).toEqual(Object.values(TypeOfTagline));
	});

	it(`should get contests for customer, status: all`, async (): Promise<void> => {
		const response:
			| CustomerContestsResDto
			| CreatorContestsResDto
			| ModeratorContestResDto = await contestService.getContests(
			userIdSecondCustomer.id,
			Role.customer,
			queryGetContestsCustomerAll,
			{
				take: +queryGetContestsCustomerAll.limit,
				skip: +queryGetContestsCustomerAll.page * 8,
			},
		);

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

		expect(isArray(response.contests)).toBe(true);
		expect(response.totalCount).toBe(dataContests.length);
		expect(response.contests[0]).toHaveProperty('id');
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('title', dataContests[0].title);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('contestType', dataContests[0].contestType);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('typeOfName', dataContests[0].typeOfName);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('brandStyle', dataContests[0].brandStyle);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('typeOfTagline', dataContests[0].typeOfTagline);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('createdAt', dataContests[0].createdAt);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('price', dataContests[0].price);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('_count');
		expect(
			isObject(
				getItemResponseBodyToCheck(response.contests as ContestDto[])._count,
			),
		).toBe(true);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[])._count,
		).toHaveProperty('offers', countOffers.length);
	});

	it(`should get contests for customer, status: active`, async (): Promise<void> => {
		const response:
			| CustomerContestsResDto
			| CreatorContestsResDto
			| ModeratorContestResDto = await contestService.getContests(
			userIdSecondCustomer.id,
			Role.customer,
			queryGetContestsCustomerActive,
			{
				take: +queryGetContestsCustomerActive.limit,
				skip: +queryGetContestsCustomerActive.page * 8,
			},
		);

		const dataContests: Contest[] = dataIdContests.filter(
			(dataContest: Contest): boolean =>
				dataContest['user'].id === userIdSecondCustomer.id &&
				dataContest.status === ContestStatus.active,
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

		expect(isArray(response.contests)).toBe(true);
		expect(response.totalCount).toBe(dataContests.length);
		expect(response.contests[0]).toHaveProperty('id');
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('title', dataContests[0].title);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('contestType', dataContests[0].contestType);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('typeOfName', dataContests[0].typeOfName);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('brandStyle', dataContests[0].brandStyle);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('typeOfTagline', dataContests[0].typeOfTagline);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('createdAt', dataContests[0].createdAt);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('price', dataContests[0].price);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('_count');
		expect(
			isObject(
				getItemResponseBodyToCheck(response.contests as ContestDto[])._count,
			),
		).toBe(true);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[])._count,
		).toHaveProperty('offers', countOffers.length);
	});

	it(`should get contests for creator, status: all,  industry: all, typeIndex: "name,tagline,logo"`, async (): Promise<void> => {
		const response:
			| CustomerContestsResDto
			| CreatorContestsResDto
			| ModeratorContestResDto = await contestService.getContests(
			userIdFirstCreator.id,
			Role.creator,
			queryGetContestsCreatorAll,
			{
				take: +queryGetContestsCreatorAll.limit,
				skip: +queryGetContestsCreatorAll.page * 8,
			},
		);

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

		const getItemResponseBodyToCheck = (itemsArray: ContestDto[]): ContestDto =>
			itemsArray.filter(
				(item: ContestDto): boolean =>
					item.id === dataContests[dataContests.length - 1].id,
			)[0];

		expect(isArray(response.contests)).toBe(true);
		expect(response.totalCount).toBe(dataContests.length);
		expect(response.contests[0]).toHaveProperty('id');
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('title', dataContests[dataContests.length - 1].title);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty(
			'contestType',
			dataContests[dataContests.length - 1].contestType,
		);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty(
			'typeOfName',
			dataContests[dataContests.length - 1].typeOfName,
		);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty(
			'brandStyle',
			dataContests[dataContests.length - 1].brandStyle,
		);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty(
			'typeOfTagline',
			dataContests[dataContests.length - 1].typeOfTagline,
		);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty(
			'createdAt',
			dataContests[dataContests.length - 1].createdAt,
		);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('price', dataContests[dataContests.length - 1].price);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('_count');
		expect(
			isObject(
				getItemResponseBodyToCheck(response.contests as ContestDto[])._count,
			),
		).toBe(true);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[])._count,
		).toHaveProperty('offers', countOffers.length);
	});

	it(`should get contests for creator, status: active,  industry: ConsultingFirm, typeIndex: "name"`, async (): Promise<void> => {
		const response:
			| CustomerContestsResDto
			| CreatorContestsResDto
			| ModeratorContestResDto = await contestService.getContests(
			userIdFirstCreator.id,
			Role.creator,
			queryGetContestsCreatorActive,
			{
				take: +queryGetContestsCreatorActive.limit,
				skip: +queryGetContestsCreatorActive.page * 8,
			},
		);

		const dataContests: Contest[] = dataIdContests.filter(
			(dataContest: Contest): boolean =>
				dataContest.status === ContestStatus.active &&
				dataContest.industry === Industry.ConsultingFirm &&
				dataContest.contestType === ContestType.name,
		);
		const countOffers: Offer[] = dataMockOffers.filter(
			(offer: Offer) =>
				offer.contestId === dataContests[dataContests.length - 1].id &&
				offer.status === OfferStatus.active,
		);

		const getItemResponseBodyToCheck = (itemsArray: ContestDto[]): ContestDto =>
			itemsArray.filter(
				(item: ContestDto): boolean =>
					item.id === dataContests[dataContests.length - 1].id,
			)[0];

		expect(isArray(response.contests)).toBe(true);
		expect(response.totalCount).toBe(dataContests.length);
		expect(response.contests[0]).toHaveProperty('id');
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('title', dataContests[dataContests.length - 1].title);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty(
			'contestType',
			dataContests[dataContests.length - 1].contestType,
		);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty(
			'typeOfName',
			dataContests[dataContests.length - 1].typeOfName,
		);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty(
			'brandStyle',
			dataContests[dataContests.length - 1].brandStyle,
		);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty(
			'typeOfTagline',
			dataContests[dataContests.length - 1].typeOfTagline,
		);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty(
			'createdAt',
			dataContests[dataContests.length - 1].createdAt,
		);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('price', dataContests[dataContests.length - 1].price);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('_count');
		expect(
			isObject(
				getItemResponseBodyToCheck(response.contests as ContestDto[])._count,
			),
		).toBe(true);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[])._count,
		).toHaveProperty('offers', countOffers.length);
	});

	it(`should get contests for moderator, industry: all, typeIndex: "name,tagline,logo"`, async (): Promise<void> => {
		const response:
			| CustomerContestsResDto
			| CreatorContestsResDto
			| ModeratorContestResDto = await contestService.getContests(
			1,
			Role.moderator,
			queryGetContestsModeratorAll,
			{
				take: +queryGetContestsModeratorAll.limit,
				skip: +queryGetContestsModeratorAll.page * 8,
			},
		);

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

		const getItemResponseBodyToCheck = (itemsArray: ContestDto[]): ContestDto =>
			itemsArray.filter(
				(item: ContestDto): boolean =>
					item.id === dataContests[dataContests.length - 1].id,
			)[0];

		expect(isArray(response.contests)).toBe(true);
		expect(response.totalCount).toBe(dataContests.length);
		expect(response.contests[0]).toHaveProperty('id');
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('title', dataContests[dataContests.length - 1].title);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty(
			'contestType',
			dataContests[dataContests.length - 1].contestType,
		);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty(
			'typeOfName',
			dataContests[dataContests.length - 1].typeOfName,
		);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty(
			'brandStyle',
			dataContests[dataContests.length - 1].brandStyle,
		);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty(
			'typeOfTagline',
			dataContests[dataContests.length - 1].typeOfTagline,
		);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[]),
		).toHaveProperty('_count');
		expect(
			isObject(
				getItemResponseBodyToCheck(response.contests as ContestDto[])._count,
			),
		).toBe(true);
		expect(
			getItemResponseBodyToCheck(response.contests as ContestDto[])._count,
		).toHaveProperty('offers', countOffers.length);
	});

	it(`should get contests by id for customer`, async (): Promise<void> => {
		const dataContest: Contest = dataIdContests.filter(
			(dataContest: Contest): boolean =>
				dataContest['user'].id === userIdFirstCustomer.id &&
				dataContest.status === ContestStatus.active,
		)[0];

		const response:
			| CustomerContestByIdResDto
			| CreatorContestByIdResDto
			| ModeratorContestByIdResDto = await contestService.getContestById(
			userIdFirstCustomer.id,
			Role.customer,
			dataContest.id,
		);

		const countOffers: Offer[] = dataMockOffers.filter(
			(offer: Offer) =>
				offer.contestId === dataContest.id &&
				offer.status === OfferStatus.active,
		);

		expect(isObject(response)).toBe(true);
		expect(response).toHaveProperty('id', dataContest.id);
		expect(response).toHaveProperty('title', dataContest.title);
		expect(response).toHaveProperty('contestType', dataContest.contestType);
		expect(response).toHaveProperty('typeOfName', dataContest.typeOfName);
		expect(response).toHaveProperty('brandStyle', dataContest.brandStyle);
		expect(response).toHaveProperty('typeOfTagline', dataContest.typeOfTagline);
		expect(response).toHaveProperty('createdAt', dataContest.createdAt);
		expect(response).toHaveProperty('price', dataContest.price);
		expect(response).toHaveProperty('fileName', dataContest.fileName);
		expect(response).toHaveProperty(
			'originalFileName',
			dataContest.originalFileName,
		);
		expect(response).toHaveProperty('focusOfWork', dataContest.focusOfWork);
		expect(response).toHaveProperty('industry', dataContest.industry);
		expect(response).toHaveProperty('nameVenture', dataContest.nameVenture);
		expect(response).toHaveProperty('styleName', dataContest.styleName);
		expect(response).toHaveProperty(
			'targetCustomer',
			dataContest.targetCustomer,
		);
		expect(response).toHaveProperty('_count');
		expect(isObject(response._count)).toBe(true);
		expect(response._count).toHaveProperty('offers', countOffers.length);
	});

	it(`should get contests by id for creator`, async (): Promise<void> => {
		const dataContest: Contest = dataIdContests.filter(
			(dataContest: Contest): boolean =>
				dataContest.status === ContestStatus.active,
		)[0];

		const response:
			| CustomerContestByIdResDto
			| CreatorContestByIdResDto
			| ModeratorContestByIdResDto = await contestService.getContestById(
			userIdFirstCreator.id,
			Role.creator,
			dataContest.id,
		);

		const countOffers: Offer[] = dataMockOffers.filter(
			(offer: Offer) =>
				offer.contestId === dataContest.id &&
				offer.status === OfferStatus.active,
		);

		expect(isObject(response)).toBe(true);
		expect(response).toHaveProperty('id', dataContest.id);
		expect(response).toHaveProperty('title', dataContest.title);
		expect(response).toHaveProperty('contestType', dataContest.contestType);
		expect(response).toHaveProperty('typeOfName', dataContest.typeOfName);
		expect(response).toHaveProperty('brandStyle', dataContest.brandStyle);
		expect(response).toHaveProperty('typeOfTagline', dataContest.typeOfTagline);
		expect(response).toHaveProperty('createdAt', dataContest.createdAt);
		expect(response).toHaveProperty('price', dataContest.price);
		expect(response).toHaveProperty('fileName', dataContest.fileName);
		expect(response).toHaveProperty(
			'originalFileName',
			dataContest.originalFileName,
		);
		expect(response).toHaveProperty('focusOfWork', dataContest.focusOfWork);
		expect(response).toHaveProperty('industry', dataContest.industry);
		expect(response).toHaveProperty('nameVenture', dataContest.nameVenture);
		expect(response).toHaveProperty('styleName', dataContest.styleName);
		expect(response).toHaveProperty(
			'targetCustomer',
			dataContest.targetCustomer,
		);
		expect(response).toHaveProperty('user');
		expect(isObject(response['user'])).toBe(true);
		expect(response['user']).toHaveProperty(
			'firstName',
			dataContest['user'].firstName,
		);
		expect(response['user']).toHaveProperty(
			'lastName',
			dataContest['user'].lastName,
		);
		expect(response['user']).toHaveProperty(
			'displayName',
			dataContest['user'].displayName,
		);
		expect(response['user']).toHaveProperty(
			'avatar',
			dataContest['user'].avatar,
		);
		expect(response).toHaveProperty('_count');
		expect(isObject(response._count)).toBe(true);
		expect(response._count).toHaveProperty('offers', countOffers.length);
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

		const response:
			| CustomerContestByIdResDto
			| CreatorContestByIdResDto
			| ModeratorContestByIdResDto = await contestService.getContestById(
			1,
			Role.moderator,
			dataContest.id,
		);

		const countOffers: Offer[] = dataMockOffers.filter(
			(offer: Offer) =>
				offer.contestId === dataContest.id &&
				offer.status === OfferStatus.pending,
		);

		expect(isObject(response)).toBe(true);
		expect(response).toHaveProperty('id', dataContest.id);
		expect(response).toHaveProperty('title', dataContest.title);
		expect(response).toHaveProperty('contestType', dataContest.contestType);
		expect(response).toHaveProperty('typeOfName', dataContest.typeOfName);
		expect(response).toHaveProperty('brandStyle', dataContest.brandStyle);
		expect(response).toHaveProperty('typeOfTagline', dataContest.typeOfTagline);
		expect(response).toHaveProperty('createdAt', dataContest.createdAt);
		expect(response).toHaveProperty('fileName', dataContest.fileName);
		expect(response).toHaveProperty(
			'originalFileName',
			dataContest.originalFileName,
		);
		expect(response).toHaveProperty('focusOfWork', dataContest.focusOfWork);
		expect(response).toHaveProperty('industry', dataContest.industry);
		expect(response).toHaveProperty('nameVenture', dataContest.nameVenture);
		expect(response).toHaveProperty('styleName', dataContest.styleName);
		expect(response).toHaveProperty(
			'targetCustomer',
			dataContest.targetCustomer,
		);
		expect(response).toHaveProperty('_count');
		expect(isObject(response._count)).toBe(true);
		expect(response._count).toHaveProperty('offers', countOffers.length);
	});

	it(`should create one contest`, async (): Promise<void> => {
		const dataContests: ICreatContest[] = createOneContest.map(
			(contest: ICreatContest): ICreatContest => ({
				...contest,
				userId: userIdFirstCustomer.id,
			}),
		);
		const response: number = await contestService.createContests(dataContests);
		expect(response).toBe(dataContests.length);
	});

	it(`should create two contests`, async (): Promise<void> => {
		const dataContests: ICreatContest[] = createTwoContests.map(
			(contest: ICreatContest): ICreatContest => ({
				...contest,
				userId: userIdFirstCustomer.id,
			}),
		);
		const response: number = await contestService.createContests(dataContests);
		expect(response).toBe(dataContests.length);
	});

	it(`should create three contests`, async (): Promise<void> => {
		const dataContests: ICreatContest[] = createThreeContests.map(
			(contest: ICreatContest): ICreatContest => ({
				...contest,
				userId: userIdFirstCustomer.id,
			}),
		);
		const response: number = await contestService.createContests(dataContests);
		expect(response).toBe(dataContests.length);
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

		const response: CustomerContestByIdResDto =
			await contestService.updateContest(
				dataContest.id,
				updateContestTypeName,
				userIdFirstCustomer.id,
			);

		expect(isObject(response)).toBe(true);
		expect(response).toHaveProperty('id', dataContest.id);
		expect(response).toHaveProperty('title', updateContestTypeName.title);
		expect(response).toHaveProperty('contestType', dataContest.contestType);
		expect(response).toHaveProperty(
			'typeOfName',
			updateContestTypeName.typeOfName,
		);
		expect(response).toHaveProperty('brandStyle', dataContest.brandStyle);
		expect(response).toHaveProperty('typeOfTagline', dataContest.typeOfTagline);
		expect(response).toHaveProperty('createdAt', dataContest.createdAt);
		expect(response).toHaveProperty('price', dataContest.price);
		expect(response).toHaveProperty('fileName', dataContest.fileName);
		expect(response).toHaveProperty(
			'originalFileName',
			dataContest.originalFileName,
		);
		expect(response).toHaveProperty(
			'focusOfWork',
			updateContestTypeName.focusOfWork,
		);
		expect(response).toHaveProperty('industry', updateContestTypeName.industry);

		expect(response).toHaveProperty('nameVenture', dataContest.nameVenture);
		expect(response).toHaveProperty(
			'styleName',
			updateContestTypeName.styleName,
		);
		expect(response).toHaveProperty(
			'targetCustomer',
			updateContestTypeName.targetCustomer,
		);
		expect(response).toHaveProperty('_count');
		expect(isObject(response._count)).toBe(true);
		expect(response._count).toHaveProperty('offers', countOffers.length);
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

		const response: CustomerContestByIdResDto =
			await contestService.updateContest(
				dataContest.id,
				updateContestTypeTagLine,
				userIdFirstCustomer.id,
			);

		expect(isObject(response)).toBe(true);
		expect(response).toHaveProperty('id', dataContest.id);
		expect(response).toHaveProperty('title', updateContestTypeTagLine.title);
		expect(response).toHaveProperty('contestType', dataContest.contestType);
		expect(response).toHaveProperty('typeOfName', dataContest.typeOfName);
		expect(response).toHaveProperty('brandStyle', dataContest.brandStyle);
		expect(response).toHaveProperty(
			'typeOfTagline',
			updateContestTypeTagLine.typeOfTagline,
		);
		expect(response).toHaveProperty('createdAt', dataContest.createdAt);
		expect(response).toHaveProperty('price', dataContest.price);
		expect(response).toHaveProperty('fileName', dataContest.fileName);
		expect(response).toHaveProperty(
			'originalFileName',
			dataContest.originalFileName,
		);
		expect(response).toHaveProperty(
			'focusOfWork',
			updateContestTypeTagLine.focusOfWork,
		);
		expect(response).toHaveProperty(
			'industry',
			updateContestTypeTagLine.industry,
		);

		expect(response).toHaveProperty(
			'nameVenture',
			updateContestTypeTagLine.nameVenture,
		);
		expect(response).toHaveProperty('styleName', dataContest.styleName);
		expect(response).toHaveProperty(
			'targetCustomer',
			updateContestTypeTagLine.targetCustomer,
		);
		expect(response).toHaveProperty('_count');
		expect(isObject(response._count)).toBe(true);
		expect(response._count).toHaveProperty('offers', countOffers.length);
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

		const response: CustomerContestByIdResDto =
			await contestService.updateContest(
				dataContest.id,
				updateContestTypeLogo,
				userIdSecondCustomer.id,
			);

		expect(isObject(response)).toBe(true);
		expect(response).toHaveProperty('id', dataContest.id);
		expect(response).toHaveProperty('title', updateContestTypeLogo.title);
		expect(response).toHaveProperty('contestType', dataContest.contestType);
		expect(response).toHaveProperty('typeOfName', dataContest.typeOfName);
		expect(response).toHaveProperty(
			'brandStyle',
			updateContestTypeLogo.brandStyle,
		);
		expect(response).toHaveProperty('typeOfTagline', dataContest.typeOfTagline);
		expect(response).toHaveProperty('createdAt', dataContest.createdAt);
		expect(response).toHaveProperty('price', dataContest.price);
		expect(response).toHaveProperty('fileName', dataContest.fileName);
		expect(response).toHaveProperty(
			'originalFileName',
			dataContest.originalFileName,
		);
		expect(response).toHaveProperty(
			'focusOfWork',
			updateContestTypeLogo.focusOfWork,
		);
		expect(response).toHaveProperty('industry', updateContestTypeLogo.industry);

		expect(response).toHaveProperty(
			'nameVenture',
			updateContestTypeLogo.nameVenture,
		);
		expect(response).toHaveProperty('styleName', dataContest.styleName);
		expect(response).toHaveProperty(
			'targetCustomer',
			updateContestTypeLogo.targetCustomer,
		);
		expect(response).toHaveProperty('_count');
		expect(isObject(response._count)).toBe(true);
		expect(response._count).toHaveProperty('offers', countOffers.length);
	});
});
