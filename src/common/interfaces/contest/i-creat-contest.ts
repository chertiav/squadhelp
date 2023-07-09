import { ContestStatus, ContestType } from '@prisma/client';

export interface ICreatContest {
	contestType: ContestType;
	title?: string;
	industry?: string;
	typeOfName?: string;
	styleName?: string;
	brandStyle?: string;
	typeOfTagline?: string;
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
