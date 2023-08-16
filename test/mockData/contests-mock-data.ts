import { ICreatContest } from '../../src/common/interfaces/contest';
import {
	BrandStyle,
	ContestStatus,
	ContestType,
	Industry,
	StyleName,
	TypeOfName,
	TypeOfTagline,
} from '@prisma/client';
import {
	LogoContestUpdateDto,
	NameContestUpdateData,
	QueryCreatorContestDto,
	QueryCustomerContestDto,
	QueryModeratorContestDto,
	TagLineContestUpdateDto,
} from '../../src/common/dto/contest';

export const contestMockDataFirstCustomer: ICreatContest[] = [
	{
		contestType: ContestType.name,
		fileName: null,
		originalFileName: null,
		title: 'First',
		typeOfName: TypeOfName.Company,
		industry: Industry.CreativeAgency,
		focusOfWork: 'What does your company',
		targetCustomer: 'Tell us about your customers',
		styleName: StyleName.Classic,
		nameVenture: null,
		typeOfTagline: null,
		status: ContestStatus.active,
		brandStyle: null,
		price: 100,
		priority: 1,
		orderId: '0099108a-080d-42e4-8c0a-a693d0c0e2c0',
		userId: null,
	},
	{
		contestType: ContestType.name,
		fileName: null,
		originalFileName: null,
		title: 'Third',
		typeOfName: TypeOfName.Company,
		industry: Industry.CreativeAgency,
		focusOfWork: 'What does your company',
		targetCustomer: 'Tell us about your customers',
		styleName: StyleName.Classic,
		nameVenture: null,
		typeOfTagline: null,
		status: ContestStatus.active,
		brandStyle: null,
		price: 100,
		priority: 1,
		orderId: 'd4026df1-78c2-46f5-9432-b32275ff5cbb',
		userId: null,
	},
	{
		contestType: ContestType.name,
		fileName: null,
		originalFileName: null,
		title: 'fifth',
		typeOfName: TypeOfName.Company,
		industry: Industry.CreativeAgency,
		focusOfWork: 'What does your company',
		targetCustomer: 'Tell us about your customers',
		styleName: StyleName.Classic,
		nameVenture: null,
		typeOfTagline: null,
		status: ContestStatus.active,
		brandStyle: null,
		price: 100,
		priority: 1,
		orderId: '6f6a173c-b998-4e35-be85-054b6a995279',
		userId: null,
	},
	{
		contestType: ContestType.name,
		fileName: null,
		originalFileName: null,
		title: 'seventh',
		typeOfName: TypeOfName.Product,
		industry: Industry.ConsultingFirm,
		focusOfWork: 'What does your company',
		targetCustomer: 'Tell us about your customers',
		styleName: StyleName.Classic,
		nameVenture: null,
		typeOfTagline: null,
		status: ContestStatus.finished,
		brandStyle: null,
		price: 100,
		priority: 1,
		orderId: 'a96e7f14-65cf-44ad-a9ad-546837e80790',
		userId: null,
	},
	{
		contestType: ContestType.tagline,
		fileName: null,
		originalFileName: null,
		title: 'ninth',
		typeOfName: null,
		industry: Industry.CreativeAgency,
		focusOfWork: 'What does your company',
		targetCustomer: 'Tell us about your customers',
		styleName: null,
		nameVenture: 'name venture',
		typeOfTagline: StyleName.Classic,
		status: ContestStatus.active,
		brandStyle: null,
		price: 100,
		priority: 1,
		orderId: '2b5d8aa9-1a5c-407c-b9b6-aa366cedd23a',
		userId: null,
	},
];

export const contestMockDataSecondCustomer: ICreatContest[] = [
	{
		contestType: ContestType.name,
		fileName: null,
		originalFileName: null,
		title: 'Second',
		typeOfName: TypeOfName.Product,
		industry: Industry.ConsultingFirm,
		focusOfWork: 'What does your company',
		targetCustomer: 'Tell us about your customers',
		styleName: StyleName.Classic,
		nameVenture: null,
		typeOfTagline: null,
		status: ContestStatus.active,
		brandStyle: null,
		price: 100,
		priority: 1,
		orderId: '3a8ec870-57ea-415f-9e7e-8258e3ef7b46',
		userId: null,
	},
	{
		contestType: ContestType.name,
		fileName: null,
		originalFileName: null,
		title: 'Fourth',
		typeOfName: TypeOfName.Company,
		industry: Industry.CreativeAgency,
		focusOfWork: 'What does your company',
		targetCustomer: 'Tell us about your customers',
		styleName: StyleName.Classic,
		nameVenture: null,
		typeOfTagline: null,
		status: ContestStatus.active,
		brandStyle: null,
		price: 100,
		priority: 1,
		orderId: '124f0c9b-d510-4eb4-afa2-fb9f8e38349f',
		userId: null,
	},
	{
		contestType: ContestType.name,
		fileName: null,
		originalFileName: null,
		title: 'Sixth',
		typeOfName: TypeOfName.Company,
		industry: Industry.Education,
		focusOfWork: 'What does your company',
		targetCustomer: 'Tell us about your customers',
		styleName: StyleName.Classic,
		nameVenture: null,
		typeOfTagline: null,
		status: ContestStatus.active,
		brandStyle: null,
		price: 100,
		priority: 1,
		orderId: '5049c3e4-e575-4547-b516-d6db413527c4',
		userId: null,
	},
	{
		contestType: ContestType.tagline,
		fileName: null,
		originalFileName: null,
		title: 'Eighth',
		typeOfName: null,
		industry: Industry.CreativeAgency,
		focusOfWork: 'What does your company',
		targetCustomer: 'Tell us about your customers',
		styleName: null,
		nameVenture: 'name venture',
		typeOfTagline: TypeOfTagline.Classic,
		status: ContestStatus.pending,
		brandStyle: null,
		price: 100,
		priority: 2,
		orderId: '5049c3e4-e575-4547-b516-d6db413527c4',
		userId: null,
	},
	{
		contestType: ContestType.logo,
		fileName: null,
		originalFileName: null,
		title: 'Tenth',
		typeOfName: null,
		industry: Industry.CreativeAgency,
		focusOfWork: 'What does your company',
		targetCustomer: 'Tell us about your customers',
		styleName: null,
		nameVenture: 'name venture',
		typeOfTagline: null,
		status: ContestStatus.pending,
		brandStyle: BrandStyle.Tech,
		price: 100,
		priority: 3,
		orderId: '5049c3e4-e575-4547-b516-d6db413527c4',
		userId: null,
	},
	{
		contestType: ContestType.logo,
		fileName: null,
		originalFileName: null,
		title: 'eleventh',
		typeOfName: null,
		industry: Industry.CreativeAgency,
		focusOfWork: 'What does your company',
		targetCustomer: 'Tell us about your customers',
		styleName: null,
		nameVenture: 'name venture',
		typeOfTagline: null,
		status: ContestStatus.active,
		brandStyle: BrandStyle.Tech,
		price: 100,
		priority: 1,
		orderId: '5cfeb361-4d68-40a0-9c7b-077995e250fc',
		userId: null,
	},
];

export const queryGetContestsCustomerAll: QueryCustomerContestDto = {
	limit: 8,
	page: 0,
	status: 'all' as ContestStatus,
};

export const queryGetContestsCustomerActive: QueryCustomerContestDto = {
	limit: 8,
	page: 0,
	status: 'active',
};

export const queryGetContestsCreatorAll: QueryCreatorContestDto = {
	limit: 8,
	page: 0,
	status: 'all' as ContestStatus,
	industry: 'all' as Industry,
	typeIndex: 'name,tagline,logo',
	contestId: null,
	awardSort: 'asc',
	ownEntries: 'false',
};

export const queryGetContestsCreatorActive: QueryCreatorContestDto = {
	limit: 8,
	page: 0,
	status: ContestStatus.active,
	industry: Industry.ConsultingFirm,
	typeIndex: 'name',
	contestId: null,
	awardSort: 'asc',
	ownEntries: 'false',
};

export const queryGetContestsModeratorAll: QueryModeratorContestDto = {
	limit: 8,
	page: 0,
	industry: 'all' as Industry,
	typeIndex: 'name,tagline,logo',
	contestId: null,
};

export const updateContestTypeName: NameContestUpdateData = {
	title: 'UpdateContestName',
	typeOfName: TypeOfName.Project,
	focusOfWork: 'update focus of work',
	industry: Industry.Medical,
	styleName: StyleName.Youthful,
	targetCustomer: 'update target customer',
};

export const updateContestTypeTagLine: TagLineContestUpdateDto = {
	title: 'UpdateContestTagLine',
	focusOfWork: 'update focus of work',
	industry: Industry.Education,
	targetCustomer: 'update target customer',
	typeOfTagline: TypeOfTagline.Modern,
	nameVenture: 'update name venture',
};

export const updateContestTypeLogo: LogoContestUpdateDto = {
	title: 'UpdateContestLogo',
	focusOfWork: 'update focus of work',
	industry: Industry.Education,
	targetCustomer: 'update target customer',
	brandStyle: BrandStyle.Minimal,
	nameVenture: 'update name venture',
};

export const createOneContest: ICreatContest[] = [
	{
		contestType: ContestType.name,
		title: 'Company Name example',
		industry: Industry.CreativeAgency,
		focusOfWork: 'What does your company',
		targetCustomer: 'Tell us about your customers',
		typeOfName: TypeOfName.Company,
		styleName: StyleName.Classic,
		status: ContestStatus.active,
		userId: 0,
		priority: 1,
		orderId: '5cfeb361-4d68-40a0-9c7b-123456e250fc',
		price: 100,
	},
];

export const createTwoContests: ICreatContest[] = [
	...createOneContest,
	{
		contestType: ContestType.tagline,
		title: 'Tagline example',
		industry: Industry.Biotech,
		focusOfWork: 'What does your company',
		targetCustomer: 'Tell us about your customers',
		nameVenture: 'Name venture',
		typeOfTagline: TypeOfTagline.Fun,
		status: ContestStatus.pending,
		userId: 0,
		priority: 2,
		orderId: '5cfeb361-4d68-40a0-9c7b-123456e250fc',
		price: 100,
	},
];

export const createThreeContests: ICreatContest[] = [
	...createTwoContests,
	{
		contestType: ContestType.logo,
		title: 'Logo example',
		industry: Industry.Builders,
		focusOfWork: 'What does your company',
		targetCustomer: 'Tell us about your customers',
		nameVenture: 'Name venture',
		brandStyle: BrandStyle.Tech,
		status: ContestStatus.pending,
		userId: 0,
		priority: 3,
		orderId: '5cfeb361-4d68-40a0-9c7b-123456e250fc',
		price: 100,
	},
];
