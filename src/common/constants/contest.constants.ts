import {
	BrandStyle,
	ContestStatus,
	Industry,
	OfferStatus,
	Prisma,
	StyleName,
	TypeOfName,
	TypeOfTagline,
} from '@prisma/client';
import {
	IOptionsGetAllContests,
	IOptionsGetAllContestsModerator,
	IOptionsGetCountActiveOffers,
	IOptionsGetCountPendingOffers,
	IOptionsGetOneContest,
} from '../interfaces/constants';
import {
	CreatorContestByIdResDto,
	CreatorContestsResDto,
	CustomerContestByIdResDto,
	CustomerContestsResDto,
	LogoDataContestResDto,
	ModeratorContestByIdResDto,
	ModeratorContestResDto,
	NameDataContestResDto,
	QueryCreatorContestDto,
	QueryCustomerContestDto,
	QueryModeratorContestDto,
	TaglineDataContestResDto,
} from '../dto/contest';

//Data contest
export const INDUSTRY_API_PROPERTY_DATA_CONTEST: Industry[] = [
	'Creative Agency' as Industry,
	'Consulting Firm' as Industry,
	'Skin care' as Industry,
	'Biotech',
	'Publisher',
	'Education',
	'Footwear',
	'Medical',
	'Builders',
];

export const BRAND_STYLE_API_PROPERTY_DATA_CONTEST: BrandStyle[] = [
	'Tech',
	'Fun',
	'Fancy',
	'Minimal',
	'Brick & Mortar' as BrandStyle,
	'Photo-based' as BrandStyle,
];
export const GET_DATA_CONTEST_API_OK_RESPONSE_EXAMPLES_NAME: NameDataContestResDto =
	{
		industry: INDUSTRY_API_PROPERTY_DATA_CONTEST,
		typeOfName: Object.values(TypeOfName),
		nameStyle: Object.values(StyleName),
	};

export const GET_DATA_CONTEST_API_OK_RESPONSE_EXAMPLES_LOGO: LogoDataContestResDto =
	{
		industry: INDUSTRY_API_PROPERTY_DATA_CONTEST,
		brandStyle: BRAND_STYLE_API_PROPERTY_DATA_CONTEST,
	};

export const GET_DATA_CONTEST_API_OK_RESPONSE_EXAMPLES_TAG_LINE: TaglineDataContestResDto =
	{
		industry: INDUSTRY_API_PROPERTY_DATA_CONTEST,
		typeOfTagline: Object.values(TypeOfTagline),
	};

// get All contests

export const CONTEST_STATUS: ContestStatus[] = [
	'all' as ContestStatus,
	ContestStatus.active,
	ContestStatus.finished,
];

export const CREATOR_QUERY_CONTEST_INDUSTRY: Industry[] = [
	'all' as Industry,
	...Object.values(Industry),
];

export const CONTEST_TYPE: string[] = [
	'name,tagline,logo',
	'name',
	'tagline',
	'logo',
	'name,tagline',
	'logo,tagline',
	'name,logo',
];

export const OPTIONS_GET_ALL_CONTESTS_MODERATOR: IOptionsGetAllContestsModerator =
	{
		id: true,
		title: true,
		contestType: true,
		typeOfName: true,
		brandStyle: true,
		typeOfTagline: true,
	};

export const OPTIONS_GET_ALL_CONTESTS: IOptionsGetAllContests = {
	...OPTIONS_GET_ALL_CONTESTS_MODERATOR,
	createdAt: true,
	price: true,
};

export const API_QUERY_EXAMPLES_GET_CONTESTS_CUSTOMER: {
	description: string;
	value: QueryCustomerContestDto;
} = {
	description: `
				limit - Limit on the number of contests per request, Example : 8, required: true
				page - Number of records to skip, Example : 0, required: true
				status - Contest status, Available values : ${CONTEST_STATUS}. Example : ${CONTEST_STATUS[0]}, required: true
				`,
	value: {
		limit: 8,
		page: 0,
		status: CONTEST_STATUS[0],
	},
};

export const API_QUERY_EXAMPLES_GET_CONTESTS_CREATOR: {
	description: string;
	value: QueryCreatorContestDto;
} = {
	description: `
				limit - Limit on the number of contests per request, Example : 8, required: true
				page - Number of records to skip, Example : 0, required: true
				status - Contest status, Available values : ${CONTEST_STATUS}. Example : ${CONTEST_STATUS[0]}, required: true
				industry - Filter by industry  Available values : ${CREATOR_QUERY_CONTEST_INDUSTRY}. Example : ${CREATOR_QUERY_CONTEST_INDUSTRY[0]}, required: true
				typeIndex - Filter by type Available values:  ${CONTEST_TYPE}. . Example : ${CONTEST_TYPE[0]}, required: true
				contestId - Filter by contest id, required: false, example: null
				awardSort - Sorting order, Available values: 'asc', 'desc', example: 'asc', required: true
				ownEntries - Contests with own entries, Available values: 'true', 'false', example: 'false', required: true
				`,
	value: {
		limit: 8,
		page: 0,
		status: CONTEST_STATUS[0],
		industry: CREATOR_QUERY_CONTEST_INDUSTRY[0],
		typeIndex: CONTEST_TYPE[0],
		contestId: null,
		awardSort: 'asc',
		ownEntries: 'false',
	},
};
export const API_QUERY_EXAMPLES_GET_CONTESTS_MODERATOR: {
	description: string;
	value: QueryModeratorContestDto;
} = {
	description: `
				limit - Limit on the number of contests per request, Example : 8, required: true
				page - Number of records to skip, Example : 0, required: true
				industry - Filter by industry  Available values : ${CREATOR_QUERY_CONTEST_INDUSTRY}. Example : ${CREATOR_QUERY_CONTEST_INDUSTRY[0]}, required: true
				typeIndex - Filter by type Available values:  ${CONTEST_TYPE}. . Example : ${CONTEST_TYPE[0]}, required: true
				contestId - Filter by contest id, required: false, example: null
				`,
	value: {
		limit: 8,
		page: 0,
		industry: CREATOR_QUERY_CONTEST_INDUSTRY[0],
		typeIndex: CONTEST_TYPE[0],
		contestId: null,
	},
};

export const API_OK_RESPONSE_EXAMPLES_GET_CONTESTS_CUSTOMER: CustomerContestsResDto =
	{
		contests: [
			{
				id: 1,
				title: 'Name of contest',
				contestType: 'name',
				typeOfName: 'Company',
				brandStyle: 'Fun',
				typeOfTagline: 'Classic',
				createdAt: new Date(),
				price: new Prisma.Decimal(100),
				_count: {
					offers: 1,
				},
			},
		],
		totalCount: 1,
	};

export const API_OK_RESPONSE_EXAMPLES_GET_CONTESTS_CREATOR: CreatorContestsResDto =
	{
		contests: [
			{
				id: 1,
				title: 'Name of contest',
				contestType: 'name',
				typeOfName: 'Company',
				brandStyle: 'Fun',
				typeOfTagline: 'Classic',
				createdAt: new Date(),
				price: new Prisma.Decimal(100),
				_count: {
					offers: 1,
				},
			},
		],
		totalCount: 1,
	};

export const API_OK_RESPONSE_EXAMPLES_GET_CONTESTS_MODERATOR: ModeratorContestResDto =
	{
		contests: [
			{
				id: 1,
				title: 'Name of contest',
				contestType: 'name',
				typeOfName: 'Company',
				brandStyle: 'Fun',
				typeOfTagline: 'Classic',
				_count: {
					offers: 1,
				},
			},
		],
		totalCount: 1,
	};

// get one contests

export const OPTIONS_GET_ONE_CONTEST: IOptionsGetOneContest = {
	...OPTIONS_GET_ALL_CONTESTS,
	fileName: true,
	originalFileName: true,
	focusOfWork: true,
	industry: true,
	nameVenture: true,
	styleName: true,
	targetCustomer: true,
};

export const OPTIONS_GET_COUNT_ACTIVE_OFFERS: IOptionsGetCountActiveOffers = {
	select: {
		offers: {
			where: {
				status: OfferStatus.active,
			},
		},
	},
};

export const OPTIONS_GET_COUNT_PENDING_OFFERS: IOptionsGetCountPendingOffers = {
	select: {
		offers: {
			where: {
				status: OfferStatus.pending,
			},
		},
	},
};

export const API_OK_RESPONSE_EXAMPLES_GET_CONTEST_BY_ID_CUSTOMER: CustomerContestByIdResDto =
	{
		id: 1,
		title: 'Name of contest',
		contestType: 'name',
		typeOfName: 'Company',
		brandStyle: 'Fun',
		typeOfTagline: 'Classic',
		createdAt: new Date(),
		price: new Prisma.Decimal(100),
		fileName: '',
		originalFileName: '',
		focusOfWork: 'What does your company',
		industry: 'CreativeAgency',
		nameVenture: 'Name venture',
		styleName: 'Classic',
		targetCustomer: 'Tell us about your customers',
		_count: {
			offers: 1,
		},
	};

export const API_OK_RESPONSE_EXAMPLES_GET_CONTEST_BY_ID_CREATOR: CreatorContestByIdResDto =
	{
		id: 1,
		title: 'Name of contest',
		contestType: 'name',
		typeOfName: 'Company',
		brandStyle: 'Fun',
		typeOfTagline: 'Classic',
		createdAt: new Date(),
		price: new Prisma.Decimal(100),
		fileName: null,
		originalFileName: null,
		focusOfWork: 'What does your company',
		industry: 'CreativeAgency',
		nameVenture: 'Name venture',
		styleName: 'Classic',
		targetCustomer: 'Tell us about your customers',
		user: {
			firstName: 'Ragnar',
			lastName: 'Lodbrok',
			displayName: 'ragnarek',
			avatar: 'anon.png',
		},
		_count: {
			offers: 2,
		},
	};

export const API_OK_RESPONSE_EXAMPLES_GET_CONTEST_BY_ID_MODERATOR: ModeratorContestByIdResDto =
	{
		id: 1,
		title: 'Name of contest',
		contestType: 'name',
		typeOfName: 'Company',
		brandStyle: 'Fun',
		typeOfTagline: 'Classic',
		createdAt: new Date(),
		fileName: '',
		originalFileName: '',
		focusOfWork: 'What does your company',
		industry: 'CreativeAgency',
		nameVenture: 'Name venture',
		styleName: 'Classic',
		targetCustomer: 'Tell us about your customers',
		_count: {
			offers: 1,
		},
	};
