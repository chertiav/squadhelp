import {
	BrandStyle,
	ContestStatus,
	ContestType,
	Industry,
	Prisma,
	StyleName,
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
	typeOfName?: string;
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

export interface ICreateBulkContest extends Prisma.ContestCreateManyInput {
	contests: ICreatContest[];
}

export interface ICharacteristicsDataContest {
	type: string;
	describe: string;
}
