import { ContestStatus, Industry, OfferStatus } from '@prisma/client';
import {
	IOptionsApiPropertyDadaContest,
	IOptionsGetAllContests,
	IOptionsGetAllContestsModerator,
	IOptionsGetCountActiveOffers,
	IOptionsGetCountPendingOffers,
	IOptionsGetOneContest,
} from '../interfaces/constants';

//Data contest
export const INDUSTRY_API_PROPERTY_DATA_CONTEST: string[] = [
	'Creative Agency',
	'Consulting Firm',
	'Skin care',
	'Biotech',
	'Publisher',
	'Education',
	'Footwear',
	'Medical',
	'Builders',
];

export const BRAND_STYLE_API_PROPERTY_DATA_CONTEST: string[] = [
	'Tech',
	'Fun',
	'Fancy',
	'Minimal',
	'Brick & Mortar',
	'Photo-based',
];

export const OPTIONS_API_PROPERTY_DATA_CONTEST: IOptionsApiPropertyDadaContest =
	{
		type: 'array',
		items: {
			type: 'string',
		},
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
