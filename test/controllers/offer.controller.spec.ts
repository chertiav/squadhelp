import {
	HttpStatus,
	INestApplication,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import {
	isArray,
	isNumber,
	isObject,
	isUUID,
	useContainer,
} from 'class-validator';
import * as bcrypt from 'bcrypt';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';

import {
	Contest,
	ContestStatus,
	ContestType,
	Offer,
	OfferStatus,
	Role,
} from '@prisma/client';
import {
	contestMockDataFirstCustomer,
	contestMockDataSecondCustomer,
	offersMockDataFirstCreator,
	userMockDataFirstCreator,
	userMockDataFirstCustomer,
	userMockDataSecondCustomer,
} from '../mockData';
import { AppModule } from '../../src/modules/app/app.module';
import { ICreatContest } from '../../src/common/interfaces/contest';
import { AppMessages } from '../../src/common/messages';
import { join } from 'path';
import { seedUserDataModerator } from '../../prisma/seeders/data';
import { OFFER_STATUS_COMMAND } from '../../src/common/enum';
import { OfferDto, OfferForModeratorDto } from '../../src/common/dto/offer';

describe('Offer controller', (): void => {
	let app: INestApplication;
	let prisma: PrismaService;
	let userIdFirstCustomer: { id: number };
	let userIdSecondCustomer: { id: number };
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
		userIdFirstCreator = await prisma.user.findUnique({
			where: { email: userMockDataFirstCreator.email },
			select: { id: true },
		});
		userIdSecondCustomer = await prisma.user.findUnique({
			where: { email: userMockDataSecondCustomer.email },
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
		userIdFirstCustomer = { id: null };
		userIdFirstCreator = { id: null };
		userIdSecondCustomer = { id: null };
		dataMockContests.contests = [];
	});

	afterAll(async (): Promise<void> => {
		await prisma.$disconnect();
		await app.close();
	});

	it(`should create new offer for contest ${ContestType.name}`, async (): Promise<void> => {
		const login: request.Response = await request(app.getHttpServer())
			.post('/v1/auth/login')
			.send({
				email: userMockDataFirstCreator.email,
				password: userMockDataFirstCreator.password,
			});

		const contestForOffer: Contest[] = await prisma.contest.findMany({
			where: {
				status: ContestStatus.active,
				contestType: ContestType.name,
			},
		});

		const offerText = 'offer text';

		const response: request.Response = await request(app.getHttpServer())
			.post(`/v1/offer/create`)
			.set('Cookie', login.headers['set-cookie'])
			.field('contestId', contestForOffer[0].id)
			.field('text', offerText);

		expect(response.body).toHaveProperty('offer');
		expect(isObject(response.body.offer)).toBe(true);
		expect(isNumber(response.body.offer.id)).toBe(true);
		expect(response.body.offer).toHaveProperty('text', offerText);
		expect(response.body.offer).toHaveProperty(
			'originalFileName',
			contestForOffer[0].originalFileName,
		);
		expect(response.body.offer).toHaveProperty(
			'fileName',
			contestForOffer[0].fileName,
		);
		expect(response.body.offer).toHaveProperty('status', OfferStatus.pending);
		expect(response.body.offer).toHaveProperty('user', {
			firstName: userMockDataFirstCreator.firstName,
			avatar: 'anon.png',
			displayName: userMockDataFirstCreator.displayName,
			email: userMockDataFirstCreator.email,
			lastName: userMockDataFirstCreator.lastName,
			rating: 0,
		});
		expect(response.body).toHaveProperty(
			'message',
			AppMessages.MSG_OFFER_CREATED,
		);
		expect(response.status).toBe(HttpStatus.CREATED);
	});

	it(`should create new offer for contest ${ContestType.tagline}`, async (): Promise<void> => {
		const login: request.Response = await request(app.getHttpServer())
			.post('/v1/auth/login')
			.send({
				email: userMockDataFirstCreator.email,
				password: userMockDataFirstCreator.password,
			});

		const contestForOffer: Contest[] = await prisma.contest.findMany({
			where: {
				status: ContestStatus.active,
				contestType: ContestType.tagline,
			},
		});

		const offerText = 'offer text';

		const response: request.Response = await request(app.getHttpServer())
			.post(`/v1/offer/create`)
			.set('Cookie', login.headers['set-cookie'])
			.field('contestId', contestForOffer[0].id)
			.field('text', offerText);

		expect(response.body).toHaveProperty('offer');
		expect(isObject(response.body.offer)).toBe(true);
		expect(isNumber(response.body.offer.id)).toBe(true);
		expect(response.body.offer).toHaveProperty('text', offerText);
		expect(response.body.offer).toHaveProperty(
			'originalFileName',
			contestForOffer[0].originalFileName,
		);
		expect(response.body.offer).toHaveProperty(
			'fileName',
			contestForOffer[0].fileName,
		);
		expect(response.body.offer).toHaveProperty('status', OfferStatus.pending);
		expect(response.body.offer).toHaveProperty('user', {
			firstName: userMockDataFirstCreator.firstName,
			avatar: 'anon.png',
			displayName: userMockDataFirstCreator.displayName,
			email: userMockDataFirstCreator.email,
			lastName: userMockDataFirstCreator.lastName,
			rating: 0,
		});
		expect(response.body).toHaveProperty(
			'message',
			AppMessages.MSG_OFFER_CREATED,
		);
		expect(response.status).toBe(HttpStatus.CREATED);
	});

	it(`should create new offer for contest ${ContestType.logo}`, async (): Promise<void> => {
		const login: request.Response = await request(app.getHttpServer())
			.post('/v1/auth/login')
			.send({
				email: userMockDataFirstCreator.email,
				password: userMockDataFirstCreator.password,
			});

		const contestForOffer: Contest[] = await prisma.contest.findMany({
			where: {
				status: ContestStatus.active,
				contestType: ContestType.logo,
			},
		});

		const fileName = 'avatarka.jpg';
		const testFile: string = join(__dirname, '../mockImages', fileName);

		const response: request.Response = await request(app.getHttpServer())
			.post(`/v1/offer/create`)
			.set('Cookie', login.headers['set-cookie'])
			.field('contestId', contestForOffer[0].id)
			.attach('file', testFile);

		expect(response.body).toHaveProperty('offer');
		expect(isObject(response.body.offer)).toBe(true);
		expect(isNumber(response.body.offer.id)).toBe(true);
		expect(response.body.offer).toHaveProperty('text', null);
		expect(response.body.offer).toHaveProperty('originalFileName', fileName);
		expect(response.body.offer).toHaveProperty('fileName');
		expect(isUUID(response.body.offer.fileName.split('.')[0])).toBe(true);
		expect(response.body.offer).toHaveProperty('status', OfferStatus.pending);
		expect(response.body.offer).toHaveProperty('user', {
			firstName: userMockDataFirstCreator.firstName,
			avatar: 'anon.png',
			displayName: userMockDataFirstCreator.displayName,
			email: userMockDataFirstCreator.email,
			lastName: userMockDataFirstCreator.lastName,
			rating: 0,
		});
		expect(response.body).toHaveProperty(
			'message',
			AppMessages.MSG_OFFER_CREATED,
		);
		expect(response.status).toBe(HttpStatus.CREATED);
	});

	it(`should delete offer by moderator`, async (): Promise<void> => {
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

		const login: request.Response = await request(app.getHttpServer())
			.post('/v1/auth/login')
			.send({
				email: seedUserDataModerator.email,
				password: seedUserDataModerator.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.delete(`/v1/offer/delete/${offerId.id}`)
			.set('Cookie', login.headers['set-cookie']);

		expect(response.body).toHaveProperty(
			'message',
			AppMessages.MSG_OFFER_DELETED,
		);
		expect(response.status).toBe(HttpStatus.OK);
	});

	it(`should set active offer status by moderator`, async (): Promise<void> => {
		const contestForOffer: Contest[] = await prisma.contest.findMany({
			where: {
				status: ContestStatus.active,
				contestType: ContestType.name,
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

		const login: request.Response = await request(app.getHttpServer())
			.post('/v1/auth/login')
			.send({
				email: seedUserDataModerator.email,
				password: seedUserDataModerator.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.patch(`/v1/offer/set-status`)
			.set('Cookie', login.headers['set-cookie'])
			.send({
				command: OFFER_STATUS_COMMAND.active,
				offerId: offerData.id,
				emailCreator: userMockDataFirstCreator.email,
				emailCustomer: offerData.contest.user.email,
			});

		expect(response.body).toHaveProperty('id', offerData.id);
		expect(response.body).toHaveProperty('text', offerText);
		expect(response.body).toHaveProperty('originalFileName', null);
		expect(response.body).toHaveProperty('fileName', null);
		expect(response.body).toHaveProperty('status', OfferStatus.active);
		expect(response.status).toBe(HttpStatus.OK);
	});

	it(`should set offer status by customer`, async (): Promise<void> => {
		const contestForOffer: Contest[] = await prisma.contest.findMany({
			where: {
				status: ContestStatus.active,
				contestType: ContestType.name,
				user: {
					email: userMockDataFirstCustomer.email,
				},
			},
		});
		const offerText = 'offer text';
		const offerId: { id: number } = await prisma.offer.create({
			data: {
				contestId: contestForOffer[0].id,
				text: offerText,
				status: OfferStatus.pending,
				userId: userIdFirstCreator.id,
			},
			select: { id: true },
		});

		const login: request.Response = await request(app.getHttpServer())
			.post('/v1/auth/login')
			.send({
				email: userMockDataFirstCustomer.email,
				password: userMockDataFirstCustomer.password,
			});

		const response: request.Response = await request(app.getHttpServer())
			.patch(`/v1/offer/set-status`)
			.set('Cookie', login.headers['set-cookie'])
			.send({
				contestId: contestForOffer[0].id,
				command: OFFER_STATUS_COMMAND.reject,
				offerId: offerId.id,
				creatorId: userIdFirstCreator.id,
				orderId: contestForOffer[0].orderId,
				priority: contestForOffer[0].priority,
				emailCreator: userMockDataFirstCreator.email,
			});

		expect(response.body).toHaveProperty('id', offerId.id);
		expect(response.body).toHaveProperty('text', offerText);
		expect(response.body).toHaveProperty('originalFileName', null);
		expect(response.body).toHaveProperty('fileName', null);
		expect(response.body).toHaveProperty('status', OfferStatus.rejected);
		expect(response.status).toBe(HttpStatus.OK);
	});

	it(`should get all active offers for ${Role.customer}`, async (): Promise<void> => {
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

		const login: request.Response = await request(app.getHttpServer())
			.post('/v1/auth/login')
			.send({
				email: userMockDataFirstCustomer.email,
				password: userMockDataFirstCustomer.password,
			});
		const response: request.Response = await request(app.getHttpServer())
			.get(`/v1/offer`)
			.set('Cookie', login.headers['set-cookie'])
			.query({
				limit: 8,
				page: 0,
				contestId: dataContest.id,
			});

		const getOfferForCheck = (offers: OfferDto[]): OfferDto[] =>
			offers.filter(
				(offer: OfferDto): boolean => offer.text === offerForCheck.text,
			);

		expect(response.body).toHaveProperty('offers');
		expect(isArray(response.body.offers)).toBe(true);
		expect(getOfferForCheck(response.body.offers)[0]).toHaveProperty('id');
		expect(getOfferForCheck(response.body.offers)[0]).toHaveProperty(
			'text',
			offerForCheck.text,
		);
		expect(getOfferForCheck(response.body.offers)[0]).toHaveProperty(
			'fileName',
			offerForCheck.fileName,
		);
		expect(getOfferForCheck(response.body.offers)[0]).toHaveProperty(
			'originalFileName',
			offerForCheck.originalFileName,
		);
		expect(getOfferForCheck(response.body.offers)[0]).toHaveProperty(
			'status',
			OfferStatus.active,
		);
		expect(getOfferForCheck(response.body.offers)[0]).toHaveProperty('user');
		expect(isObject(getOfferForCheck(response.body.offers)[0].user)).toBe(true);
		expect(getOfferForCheck(response.body.offers)[0].user).toHaveProperty('id');
		expect(isNumber(getOfferForCheck(response.body.offers)[0].user.id)).toBe(
			true,
		);
		expect(getOfferForCheck(response.body.offers)[0].user).toHaveProperty(
			'firstName',
			userMockDataFirstCreator.firstName,
		);
		expect(getOfferForCheck(response.body.offers)[0].user).toHaveProperty(
			'lastName',
			userMockDataFirstCreator.lastName,
		);
		expect(getOfferForCheck(response.body.offers)[0].user).toHaveProperty(
			'email',
			userMockDataFirstCreator.email,
		);
		expect(getOfferForCheck(response.body.offers)[0].user).toHaveProperty(
			'avatar',
			'anon.png',
		);
		expect(getOfferForCheck(response.body.offers)[0].user).toHaveProperty(
			'rating',
			0,
		);
		expect(getOfferForCheck(response.body.offers)[0]).toHaveProperty('ratings');
		expect(isArray(getOfferForCheck(response.body.offers)[0].ratings)).toBe(
			true,
		);
		expect(isObject(getOfferForCheck(response.body.offers)[0].ratings[0])).toBe(
			true,
		);
		expect(getOfferForCheck(response.body.offers)[0].ratings[0]).toHaveProperty(
			'mark',
			0,
		);
		expect(response.body).toHaveProperty('totalCount', idContestsOffers.length);
		expect(response.status).toBe(HttpStatus.OK);
	});

	it(`should get all active offers for ${Role.moderator}`, async (): Promise<void> => {
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

		const login: request.Response = await request(app.getHttpServer())
			.post('/v1/auth/login')
			.send({
				email: seedUserDataModerator.email,
				password: seedUserDataModerator.password,
			});
		const response: request.Response = await request(app.getHttpServer())
			.get(`/v1/offer`)
			.set('Cookie', login.headers['set-cookie'])
			.query({
				limit: 8,
				page: 0,
				contestId: dataContest.id,
			});

		const getOfferForCheck = (
			offers: OfferForModeratorDto[],
		): OfferForModeratorDto[] =>
			offers.filter(
				(offer: OfferForModeratorDto): boolean =>
					offer.text === offerForCheck.text,
			);
		expect(response.body).toHaveProperty('offers');
		expect(isArray(response.body.offers)).toBe(true);
		expect(getOfferForCheck(response.body.offers)[0]).toHaveProperty('id');
		expect(getOfferForCheck(response.body.offers)[0]).toHaveProperty(
			'text',
			offerForCheck.text,
		);
		expect(getOfferForCheck(response.body.offers)[0]).toHaveProperty(
			'fileName',
			offerForCheck.fileName,
		);
		expect(getOfferForCheck(response.body.offers)[0]).toHaveProperty(
			'originalFileName',
			offerForCheck.originalFileName,
		);
		expect(getOfferForCheck(response.body.offers)[0]).toHaveProperty(
			'status',
			OfferStatus.pending,
		);
		expect(getOfferForCheck(response.body.offers)[0]).toHaveProperty('user');
		expect(isObject(getOfferForCheck(response.body.offers)[0].user)).toBe(true);
		expect(getOfferForCheck(response.body.offers)[0].user).toHaveProperty(
			'email',
			userMockDataFirstCreator.email,
		);
		expect(getOfferForCheck(response.body.offers)[0]).toHaveProperty('contest');
		expect(isObject(getOfferForCheck(response.body.offers)[0].contest)).toBe(
			true,
		);
		expect(getOfferForCheck(response.body.offers)[0].contest).toHaveProperty(
			'user',
			{
				email: dataContestFirstCustomer?.id
					? userMockDataFirstCustomer.email
					: userMockDataSecondCustomer.email,
			},
		);
		expect(response.body).toHaveProperty('totalCount', idContestsOffers.length);
		expect(response.status).toBe(HttpStatus.OK);
	});

	it(`should get all active offers for ${Role.creator}`, async (): Promise<void> => {
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

		const login: request.Response = await request(app.getHttpServer())
			.post('/v1/auth/login')
			.send({
				email: userMockDataFirstCreator.email,
				password: userMockDataFirstCreator.password,
			});
		const response: request.Response = await request(app.getHttpServer())
			.get(`/v1/offer`)
			.set('Cookie', login.headers['set-cookie'])
			.query({
				limit: 8,
				page: 0,
				contestId: dataContest.id,
			});

		const getOfferForCheck = (offers: OfferDto[]): OfferDto[] =>
			offers.filter(
				(offer: OfferDto): boolean => offer.text === offerForCheck.text,
			);

		expect(response.body).toHaveProperty('offers');
		expect(isArray(response.body.offers)).toBe(true);
		expect(getOfferForCheck(response.body.offers)[0]).toHaveProperty('id');
		expect(getOfferForCheck(response.body.offers)[0]).toHaveProperty(
			'text',
			offerForCheck.text,
		);
		expect(getOfferForCheck(response.body.offers)[0]).toHaveProperty(
			'fileName',
			offerForCheck.fileName,
		);
		expect(getOfferForCheck(response.body.offers)[0]).toHaveProperty(
			'originalFileName',
			offerForCheck.originalFileName,
		);
		expect(getOfferForCheck(response.body.offers)[0]).toHaveProperty(
			'status',
			offerForCheck.status,
		);
		expect(getOfferForCheck(response.body.offers)[0]).toHaveProperty('user');
		expect(isObject(getOfferForCheck(response.body.offers)[0].user)).toBe(true);
		expect(getOfferForCheck(response.body.offers)[0].user).toHaveProperty('id');
		expect(isNumber(getOfferForCheck(response.body.offers)[0].user.id)).toBe(
			true,
		);
		expect(getOfferForCheck(response.body.offers)[0].user).toHaveProperty(
			'firstName',
			userMockDataFirstCreator.firstName,
		);
		expect(getOfferForCheck(response.body.offers)[0].user).toHaveProperty(
			'lastName',
			userMockDataFirstCreator.lastName,
		);
		expect(getOfferForCheck(response.body.offers)[0].user).toHaveProperty(
			'email',
			userMockDataFirstCreator.email,
		);
		expect(getOfferForCheck(response.body.offers)[0].user).toHaveProperty(
			'avatar',
			'anon.png',
		);
		expect(getOfferForCheck(response.body.offers)[0].user).toHaveProperty(
			'rating',
			0,
		);
		expect(getOfferForCheck(response.body.offers)[0]).toHaveProperty('ratings');
		expect(isArray(getOfferForCheck(response.body.offers)[0].ratings)).toBe(
			true,
		);
		expect(isObject(getOfferForCheck(response.body.offers)[0].ratings[0])).toBe(
			true,
		);
		expect(getOfferForCheck(response.body.offers)[0].ratings[0]).toHaveProperty(
			'mark',
			0,
		);
		expect(response.body).toHaveProperty('totalCount', idContestsOffers.length);
		expect(response.status).toBe(HttpStatus.OK);
	});
});
