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

export const OPTIONS_GET_ALL_CONTESTS = {
	id: true,
	title: true,
	contestType: true,
	typeOfName: true,
	brandStyle: true,
	typeOfTagline: true,
	createdAt: true,
	price: true,
};
