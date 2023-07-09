import { OfferStatus } from '@prisma/client';

export const OPTIONS_FOR_API_PROPERTY = {
	DATA_FOR_CONTEST: {
		COMMON_PROPERTY: {
			description: 'Type of contest',
			type: 'array',
			items: {
				type: 'string',
			},
		},
		EXAMPLE_TYPE_OF_NAME: ['Company', 'Product', 'Project'],
		EXAMPLE_NAME_STYLE: [
			'Classic',
			'Fun',
			'Professional',
			'Descriptive',
			'Youthful',
			'Any',
		],
		EXAMPLE_TYPE_OF_TAGLINE: [
			'Classic',
			'Fun',
			'Powerful',
			'Descriptive',
			'Modern',
			'Any',
		],
		EXAMPLE_INDUSTRY: [
			'Creative Agency',
			'Consulting Firm',
			'Skin care',
			'Biotech',
			'Publisher',
			'Education',
			'Footwear',
			'Medical',
			'Builders',
		],
		EXAMPLE_BRAND_STYLE: [
			'Techy',
			'Fun',
			'Fancy',
			'Minimal',
			'Brick & Mortar',
			'Photo-based',
		],
	},
};

export const CONTEST_TYPE: string[] = [
	'',
	'name,tagline,logo',
	'name',
	'tagline',
	'logo',
	'name,tagline',
	'logo,tagline',
	'name,logo',
];
export const OPTIONS_GET_CONTEST_MODERATOR = {
	id: true,
	title: true,
	contestType: true,
	typeOfName: true,
	createdAt: true,
};

export const OPTIONS_GET_CONTESTS = {
	...OPTIONS_GET_CONTEST_MODERATOR,
	brandStyle: true,
	typeOfTagline: true,
	price: true,
};

export const OPTIONS_GET_ONE_CONTEST_CUSTOMER = {
	...OPTIONS_GET_CONTESTS,
	fileName: true,
	focusOfWork: true,
	industry: true,
	nameVenture: true,
	styleName: true,
	targetCustomer: true,
};

export const OPTIONS_GET_COUNT_ACTIVE_OFFERS = {
	select: {
		offers: {
			where: {
				status: OfferStatus.active,
			},
		},
	},
};

export const OPTIONS_GET_COUNT_PENDING_OFFERS = {
	select: {
		offers: {
			where: {
				status: OfferStatus.pending,
			},
		},
	},
};
