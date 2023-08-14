import {
	BrandStyle,
	ContestStatus,
	ContestType,
	Industry,
	StyleName,
	TypeOfName,
	TypeOfTagline,
} from '@prisma/client';

export interface IQueryDataContest {
	characteristic1: string;
	characteristic2?: string;
}

export interface ICreatContest {
	contestType: ContestType;
	title?: string;
	industry?: Industry;
	typeOfName?: TypeOfName;
	styleName?: StyleName;
	brandStyle?: BrandStyle;
	typeOfTagline?: TypeOfTagline;
	focusOfWork?: string;
	nameVenture?: string;
	targetCustomer?: string;
	fileName?: string;
	originalFileName?: string;
	price: number;
	status: ContestStatus;
	priority: number;
	orderId: string;
	userId: number;
}

export interface ICharacteristicsDataContest {
	type: string;
	describe: string;
}
