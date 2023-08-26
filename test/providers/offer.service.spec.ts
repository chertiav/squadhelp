import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { isArray, isNumber, isObject } from 'class-validator';

import {
	Contest,
	ContestStatus,
	ContestType,
	Offer,
	OfferStatus,
	Role,
} from '@prisma/client';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { AppModule } from '../../src/modules/app/app.module';
import * as bcrypt from 'bcrypt';
import {
	contestMockDataFirstCustomer,
	contestMockDataSecondCustomer,
	offersMockDataFirstCreator,
	userMockDataFirstCreator,
	userMockDataFirstCustomer,
	userMockDataSecondCustomer,
} from '../mockData';
import { ICreatContest } from '../../src/common/interfaces/contest';
import { OfferService } from '../../src/modules/offer/offer.service';
import {
	DeleteOfferResDto,
	OfferDataDto,
	OfferDto,
	OfferForModeratorDto,
	OfferForModeratorRsDto,
	OffersResDto,
	OfferUpdateDto,
} from '../../src/common/dto/offer';
import { AppMessages } from '../../src/common/messages';
import { OFFER_STATUS_COMMAND } from '../../src/common/enum';

describe('Contest service', (): void => {
	let app: INestApplication;
	let prisma: PrismaService;
	let offerService: OfferService;
	let dataMockContests: { contests: ICreatContest[] };
	let userIdFirstCustomer: { id: number };
	let userIdSecondCustomer: { id: number };
	let userIdFirstCreator: { id: number };

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		app = moduleFixture.createNestApplication();
		prisma = app.get<PrismaService>(PrismaService);
		offerService = app.get<OfferService>(OfferService);
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
					],
				},
			},
		});
		dataMockContests.contests = [];
		userIdFirstCustomer = { id: null };
		userIdSecondCustomer = { id: null };
		userIdFirstCreator = { id: null };
	});

	afterAll(async (): Promise<void> => {
		await prisma.$disconnect();
		await app.close();
	});

	it(`should get all offers for ${Role.customer}`, async (): Promise<void> => {
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

		const pendingOffers: number[] = seedMockDataOffersFirstCreator
			.map(
				(offer: Offer) =>
					offer.status === OfferStatus.active && offer.contestId,
			)
			.filter(Boolean);

		const dataContest: Contest = dataIdContests.filter(
			(dataContest: Contest): boolean =>
				dataContest['user'].id === userIdFirstCustomer.id &&
				dataContest.status === ContestStatus.active &&
				pendingOffers.some(
					(contestId: number): boolean => contestId === dataContest.id,
				),
		)[0];

		const idContestsOffers: number[] = pendingOffers.filter(
			(contestId: number): boolean => contestId === dataContest.id,
		);

		const offerForCheck: Offer = seedMockDataOffersFirstCreator.filter(
			(offer: Offer): boolean =>
				offer.contestId === idContestsOffers[0] &&
				offer.status === OfferStatus.active,
		)[0];

		await prisma.offer.createMany({
			data: seedMockDataOffersFirstCreator,
		});
		const response: OffersResDto | OfferForModeratorRsDto =
			await offerService.getOffers(
				userIdFirstCustomer.id,
				Role.customer,
				{
					limit: 8,
					page: 0,
					contestId: dataContest.id,
				},
				{ take: 8, skip: 0 },
			);

		const getOfferForCheck = (offers: OfferDto[]): OfferDto[] =>
			offers.filter(
				(offer: OfferDto): boolean => offer.text === offerForCheck.text,
			);

		expect(response).toHaveProperty('offers');
		expect(isArray(response.offers)).toBe(true);
		expect(getOfferForCheck(response.offers as OfferDto[])[0]).toHaveProperty(
			'id',
		);
		expect(getOfferForCheck(response.offers as OfferDto[])[0]).toHaveProperty(
			'text',
			offerForCheck.text,
		);
		expect(getOfferForCheck(response.offers as OfferDto[])[0]).toHaveProperty(
			'fileName',
			offerForCheck.fileName,
		);
		expect(getOfferForCheck(response.offers as OfferDto[])[0]).toHaveProperty(
			'originalFileName',
			offerForCheck.originalFileName,
		);
		expect(getOfferForCheck(response.offers as OfferDto[])[0]).toHaveProperty(
			'status',
			OfferStatus.active,
		);
		expect(getOfferForCheck(response.offers as OfferDto[])[0]).toHaveProperty(
			'user',
		);
		expect(
			isObject(getOfferForCheck(response.offers as OfferDto[])[0].user),
		).toBe(true);
		expect(
			getOfferForCheck(response.offers as OfferDto[])[0].user,
		).toHaveProperty('id');
		expect(
			isNumber(getOfferForCheck(response.offers as OfferDto[])[0].user.id),
		).toBe(true);
		expect(
			getOfferForCheck(response.offers as OfferDto[])[0].user,
		).toHaveProperty('firstName', userMockDataFirstCreator.firstName);
		expect(
			getOfferForCheck(response.offers as OfferDto[])[0].user,
		).toHaveProperty('lastName', userMockDataFirstCreator.lastName);
		expect(
			getOfferForCheck(response.offers as OfferDto[])[0].user,
		).toHaveProperty('email', userMockDataFirstCreator.email);
		expect(
			getOfferForCheck(response.offers as OfferDto[])[0].user,
		).toHaveProperty('avatar', 'anon.png');
		expect(
			getOfferForCheck(response.offers as OfferDto[])[0].user,
		).toHaveProperty('rating', 0);
		expect(getOfferForCheck(response.offers as OfferDto[])[0]).toHaveProperty(
			'ratings',
		);
		expect(
			isArray(getOfferForCheck(response.offers as OfferDto[])[0].ratings),
		).toBe(true);
		expect(
			isObject(getOfferForCheck(response.offers as OfferDto[])[0].ratings[0]),
		).toBe(true);
		expect(
			getOfferForCheck(response.offers as OfferDto[])[0].ratings[0],
		).toHaveProperty('mark', 0);
		expect(response).toHaveProperty('totalCount', idContestsOffers.length);
	});

	it(`should get all offers for ${Role.moderator}`, async (): Promise<void> => {
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

		const pendingOffers: number[] = seedMockDataOffersFirstCreator
			.map(
				(offer: Offer) =>
					offer.status === OfferStatus.pending && offer.contestId,
			)
			.filter(Boolean);

		const dataContestFirstCustomer: Contest = dataIdContests.filter(
			(dataContest: Contest): boolean =>
				dataContest['user'].id === userIdFirstCustomer.id &&
				dataContest.status === ContestStatus.active &&
				pendingOffers.some(
					(contestId: number): boolean => contestId === dataContest.id,
				),
		)[0];

		const dataContest: Contest = dataContestFirstCustomer?.id
			? dataContestFirstCustomer
			: dataIdContests.filter(
					(dataContest: Contest): boolean =>
						dataContest['user'].id === userIdSecondCustomer.id &&
						dataContest.status === ContestStatus.active &&
						pendingOffers.some(
							(contestId: number): boolean => contestId === dataContest.id,
						),
			  )[0];

		const idContestsOffers: number[] = pendingOffers.filter(
			(contestId: number): boolean => contestId === dataContest.id,
		);

		const offerForCheck: Offer = seedMockDataOffersFirstCreator.filter(
			(offer: Offer): boolean =>
				offer.contestId === idContestsOffers[0] &&
				offer.status === OfferStatus.pending,
		)[0];

		await prisma.offer.createMany({
			data: seedMockDataOffersFirstCreator,
		});

		const response: OffersResDto | OfferForModeratorRsDto =
			await offerService.getOffers(
				1,
				Role.moderator,
				{
					limit: 8,
					page: 0,
					contestId: dataContest.id,
				},
				{ take: 8, skip: 0 },
			);

		const getOfferForCheck = (
			offers: OfferForModeratorDto[],
		): OfferForModeratorDto[] =>
			offers.filter(
				(offer: OfferForModeratorDto): boolean =>
					offer.text === offerForCheck.text,
			);

		expect(response).toHaveProperty('offers');
		expect(isArray(response.offers)).toBe(true);
		expect(getOfferForCheck(response.offers)[0]).toHaveProperty('id');
		expect(getOfferForCheck(response.offers)[0]).toHaveProperty(
			'text',
			offerForCheck.text,
		);
		expect(getOfferForCheck(response.offers)[0]).toHaveProperty(
			'fileName',
			offerForCheck.fileName,
		);
		expect(getOfferForCheck(response.offers)[0]).toHaveProperty(
			'originalFileName',
			offerForCheck.originalFileName,
		);
		expect(getOfferForCheck(response.offers)[0]).toHaveProperty(
			'status',
			OfferStatus.pending,
		);
		expect(getOfferForCheck(response.offers)[0]).toHaveProperty('user');
		expect(isObject(getOfferForCheck(response.offers)[0].user)).toBe(true);
		expect(getOfferForCheck(response.offers)[0].user).toHaveProperty(
			'email',
			userMockDataFirstCreator.email,
		);
		expect(getOfferForCheck(response.offers)[0]).toHaveProperty('contest');
		expect(isObject(getOfferForCheck(response.offers)[0].contest)).toBe(true);
		expect(getOfferForCheck(response.offers)[0].contest).toHaveProperty(
			'user',
			{
				email: dataContestFirstCustomer?.id
					? userMockDataFirstCustomer.email
					: userMockDataSecondCustomer.email,
			},
		);
		expect(response).toHaveProperty('totalCount', idContestsOffers.length);
	});

	it(`should get all offers for ${Role.creator}`, async (): Promise<void> => {
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

		const pendingOffers: number[] = seedMockDataOffersFirstCreator.map(
			(offer: Offer) => offer.contestId,
		);
		const dataContest: Contest = dataIdContests.filter(
			(dataContest: Contest): boolean =>
				dataContest.status === ContestStatus.active &&
				pendingOffers.some(
					(contestId: number): boolean => contestId === dataContest.id,
				),
		)[0];

		const idContestsOffers: number[] = pendingOffers.filter(
			(contestId: number): boolean => contestId === dataContest.id,
		);

		const offerForCheck: Offer = seedMockDataOffersFirstCreator.filter(
			(offer: Offer): boolean => offer.contestId === idContestsOffers[0],
		)[0];

		await prisma.offer.createMany({
			data: seedMockDataOffersFirstCreator,
		});

		const response: OffersResDto | OfferForModeratorRsDto =
			await offerService.getOffers(
				userIdFirstCreator.id,
				Role.creator,
				{
					limit: 8,
					page: 0,
					contestId: dataContest.id,
				},
				{ take: 8, skip: 0 },
			);

		const getOfferForCheck = (offers: OfferDto[]): OfferDto[] =>
			offers.filter(
				(offer: OfferDto): boolean => offer.text === offerForCheck.text,
			);

		expect(response).toHaveProperty('offers');
		expect(isArray(response.offers)).toBe(true);
		expect(getOfferForCheck(response.offers as OfferDto[])[0]).toHaveProperty(
			'id',
		);
		expect(getOfferForCheck(response.offers as OfferDto[])[0]).toHaveProperty(
			'text',
			offerForCheck.text,
		);
		expect(getOfferForCheck(response.offers as OfferDto[])[0]).toHaveProperty(
			'fileName',
			offerForCheck.fileName,
		);
		expect(getOfferForCheck(response.offers as OfferDto[])[0]).toHaveProperty(
			'originalFileName',
			offerForCheck.originalFileName,
		);
		expect(getOfferForCheck(response.offers as OfferDto[])[0]).toHaveProperty(
			'status',
			offerForCheck.status,
		);
		expect(getOfferForCheck(response.offers as OfferDto[])[0]).toHaveProperty(
			'user',
		);
		expect(
			isObject(getOfferForCheck(response.offers as OfferDto[])[0].user),
		).toBe(true);
		expect(
			getOfferForCheck(response.offers as OfferDto[])[0].user,
		).toHaveProperty('id');
		expect(
			isNumber(getOfferForCheck(response.offers as OfferDto[])[0].user.id),
		).toBe(true);
		expect(
			getOfferForCheck(response.offers as OfferDto[])[0].user,
		).toHaveProperty('firstName', userMockDataFirstCreator.firstName);
		expect(
			getOfferForCheck(response.offers as OfferDto[])[0].user,
		).toHaveProperty('lastName', userMockDataFirstCreator.lastName);
		expect(
			getOfferForCheck(response.offers as OfferDto[])[0].user,
		).toHaveProperty('email', userMockDataFirstCreator.email);
		expect(
			getOfferForCheck(response.offers as OfferDto[])[0].user,
		).toHaveProperty('avatar', 'anon.png');
		expect(
			getOfferForCheck(response.offers as OfferDto[])[0].user,
		).toHaveProperty('rating', 0);
		expect(getOfferForCheck(response.offers as OfferDto[])[0]).toHaveProperty(
			'ratings',
		);
		expect(
			isArray(getOfferForCheck(response.offers as OfferDto[])[0].ratings),
		).toBe(true);
		expect(
			isObject(getOfferForCheck(response.offers as OfferDto[])[0].ratings[0]),
		).toBe(true);
		expect(
			getOfferForCheck(response.offers as OfferDto[])[0].ratings[0],
		).toHaveProperty('mark', 0);
		expect(response).toHaveProperty('totalCount', idContestsOffers.length);
	});

	it(`should find one offer`, async (): Promise<void> => {
		const contestForOffer: Contest[] = await prisma.contest.findMany({
			where: {
				status: ContestStatus.active,
				contestType: ContestType.name,
			},
		});
		const offerId: { id: number } = await prisma.offer.create({
			data: {
				contestId: contestForOffer[0].id,
				text: 'offerText',
				status: OfferStatus.pending,
				userId: userIdFirstCreator.id,
			},
			select: { id: true },
		});

		const response: Offer = await offerService.findOneOffer(offerId.id, null);

		expect(response).toHaveProperty('id', offerId.id);
		expect(response).toHaveProperty('text', 'offerText');
		expect(response).toHaveProperty('fileName', null);
		expect(response).toHaveProperty('originalFileName', null);
		expect(response).toHaveProperty('status', OfferStatus.pending);
		expect(response).toHaveProperty('contestId', contestForOffer[0].id);
		expect(response).toHaveProperty('createdAt');
		expect(response.createdAt).toBeInstanceOf(Date);
		expect(response).toHaveProperty('updatedAt');
		expect(response.updatedAt).toBeInstanceOf(Date);
	});

	it(`should create new offer for contest ${ContestType.name}`, async (): Promise<void> => {
		const contestForOffer: Contest[] = await prisma.contest.findMany({
			where: {
				status: ContestStatus.active,
				contestType: ContestType.name,
			},
		});

		const offerText = 'offer text';

		const response: OfferDataDto = await offerService.createOffer(
			userIdFirstCreator.id,
			{
				contestId: contestForOffer[0].id,
				text: offerText,
			},
		);

		expect(isNumber(response.id)).toBe(true);
		expect(response).toHaveProperty('text', offerText);
		expect(response).toHaveProperty(
			'originalFileName',
			contestForOffer[0].originalFileName,
		);
		expect(response).toHaveProperty('fileName', contestForOffer[0].fileName);
		expect(response).toHaveProperty('status', OfferStatus.pending);
		expect(response).toHaveProperty('user', {
			firstName: userMockDataFirstCreator.firstName,
			avatar: 'anon.png',
			displayName: userMockDataFirstCreator.displayName,
			email: userMockDataFirstCreator.email,
			lastName: userMockDataFirstCreator.lastName,
			rating: 0,
		});
	});

	it(`should create new offer for contest ${ContestType.tagline}`, async (): Promise<void> => {
		const contestForOffer: Contest[] = await prisma.contest.findMany({
			where: {
				status: ContestStatus.active,
				contestType: ContestType.tagline,
			},
		});

		const offerText = 'offer text';

		const response: OfferDataDto = await offerService.createOffer(
			userIdFirstCreator.id,
			{
				contestId: contestForOffer[0].id,
				text: offerText,
			},
		);

		expect(isNumber(response.id)).toBe(true);
		expect(response).toHaveProperty('text', offerText);
		expect(response).toHaveProperty(
			'originalFileName',
			contestForOffer[0].originalFileName,
		);
		expect(response).toHaveProperty('fileName', contestForOffer[0].fileName);
		expect(response).toHaveProperty('status', OfferStatus.pending);
		expect(response).toHaveProperty('user', {
			firstName: userMockDataFirstCreator.firstName,
			avatar: 'anon.png',
			displayName: userMockDataFirstCreator.displayName,
			email: userMockDataFirstCreator.email,
			lastName: userMockDataFirstCreator.lastName,
			rating: 0,
		});
	});

	it(`should create new offer for contest ${ContestType.logo}`, async (): Promise<void> => {
		const contestForOffer: Contest[] = await prisma.contest.findMany({
			where: {
				status: ContestStatus.active,
				contestType: ContestType.logo,
			},
		});

		const offerFileName = 'fileName';
		const offerOriginalFileName = 'originalFileName';

		const response: OfferDataDto = await offerService.createOffer(
			userIdFirstCreator.id,
			{
				contestId: contestForOffer[0].id,
				fileName: offerFileName,
				originalFileName: offerOriginalFileName,
			},
		);

		expect(isNumber(response.id)).toBe(true);
		expect(response).toHaveProperty('text', null);
		expect(response).toHaveProperty('originalFileName', offerOriginalFileName);
		expect(response).toHaveProperty('fileName', offerFileName);
		expect(response).toHaveProperty('status', OfferStatus.pending);
		expect(response).toHaveProperty('user', {
			firstName: userMockDataFirstCreator.firstName,
			avatar: 'anon.png',
			displayName: userMockDataFirstCreator.displayName,
			email: userMockDataFirstCreator.email,
			lastName: userMockDataFirstCreator.lastName,
			rating: 0,
		});
	});

	it(`should delete offer by ${Role.moderator}`, async (): Promise<void> => {
		const contestForOffer: Contest[] = await prisma.contest.findMany({
			where: {
				status: ContestStatus.active,
				contestType: ContestType.logo,
			},
		});
		const offerId: { id: number } = await prisma.offer.create({
			data: {
				contestId: contestForOffer[0].id,
				text: 'offerText',
				status: OfferStatus.pending,
				userId: userIdFirstCreator.id,
			},
			select: { id: true },
		});

		const response: DeleteOfferResDto = await offerService.deleteOffer(
			offerId.id,
			Role.moderator,
			1,
		);

		expect(response).toHaveProperty('message', AppMessages.MSG_OFFER_DELETED);
	});

	it(`should delete offer by ${Role.creator}`, async (): Promise<void> => {
		const contestForOffer: Contest[] = await prisma.contest.findMany({
			where: {
				status: ContestStatus.active,
				contestType: ContestType.logo,
			},
		});
		const offerId: { id: number } = await prisma.offer.create({
			data: {
				contestId: contestForOffer[0].id,
				text: 'offerText',
				status: OfferStatus.pending,
				userId: userIdFirstCreator.id,
			},
			select: { id: true },
		});

		const response: DeleteOfferResDto = await offerService.deleteOffer(
			offerId.id,
			Role.creator,
			userIdFirstCreator.id,
		);

		expect(response).toHaveProperty('message', AppMessages.MSG_OFFER_DELETED);
	});

	it(`should set active offer status by ${Role.moderator}`, async (): Promise<void> => {
		const contestForOffer: Contest[] = await prisma.contest.findMany({
			where: {
				status: ContestStatus.active,
				contestType: ContestType.logo,
			},
		});
		const offerText = 'offer text';
		const offerData: { id: number; contest: { user: { email: string } } } =
			await prisma.offer.create({
				data: {
					contestId: contestForOffer[0].id,
					text: offerText,
					status: OfferStatus.pending,
					userId: userIdFirstCreator.id,
				},
				select: {
					id: true,
					contest: {
						select: {
							user: {
								select: {
									email: true,
								},
							},
						},
					},
				},
			});

		const response: OfferUpdateDto = await offerService.setOfferStatus(
			{
				command: OFFER_STATUS_COMMAND.active,
				offerId: offerData.id.toString(),
				emailCreator: userMockDataFirstCreator.email,
				emailCustomer: offerData.contest.user.email,
			},
			Role.moderator,
			1,
		);

		expect(response).toHaveProperty('id', offerData.id);
		expect(response).toHaveProperty('text', offerText);
		expect(response).toHaveProperty('originalFileName', null);
		expect(response).toHaveProperty('fileName', null);
		expect(response).toHaveProperty('status', OfferStatus.active);
	});

	it(`should set active offer status by ${Role.customer}`, async (): Promise<void> => {
		const contestForOffer: Contest[] = await prisma.contest.findMany({
			where: {
				status: ContestStatus.active,
				contestType: ContestType.logo,
			},
		});
		const offerText = 'offer text';
		const offerData: { id: number; contest: { user: { id: number } } } =
			await prisma.offer.create({
				data: {
					contestId: contestForOffer[0].id,
					text: offerText,
					status: OfferStatus.pending,
					userId: userIdFirstCreator.id,
				},
				select: {
					id: true,
					contest: {
						select: {
							user: {
								select: {
									id: true,
								},
							},
						},
					},
				},
			});

		const response: OfferUpdateDto = await offerService.setOfferStatus(
			{
				contestId: contestForOffer[0].id.toString(),
				command: OFFER_STATUS_COMMAND.reject,
				offerId: offerData.id.toString(),
				creatorId: userIdFirstCreator.id.toString(),
				orderId: contestForOffer[0].orderId,
				priority: contestForOffer[0].priority.toString(),
				emailCreator: userMockDataFirstCreator.email,
			},
			Role.customer,
			offerData.contest.user.id,
		);

		expect(response).toHaveProperty('id', offerData.id);
		expect(response).toHaveProperty('text', offerText);
		expect(response).toHaveProperty('originalFileName', null);
		expect(response).toHaveProperty('fileName', null);
		expect(response).toHaveProperty('status', OfferStatus.rejected);
	});
});
