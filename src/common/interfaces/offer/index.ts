import { ExamplesObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export interface IOfferDataMail {
	fileName?: string | null;
	originalFileName: string | null;
	text: string;
	user: {
		email: string;
	};
	contest: {
		title: string;
		user: {
			firstName: string;
			lastName: string;
		};
	};
}

export interface ISelectOfferDataMail {
	fileName?: boolean;
	originalFileName: boolean;
	text: boolean;
	user: {
		select: {
			email: boolean;
		};
	};
	contest: {
		select: {
			title: boolean;
			user: { select: { firstName: boolean; lastName: boolean } };
		};
	};
}

export interface IExamplesSetStatusCustomer {
	value: {
		contestId: string;
		command: string;
		offerId: string;
		creatorId: string;
		orderId: string;
		priority: string;
		emailCreator: string;
	};
}

export interface IExamplesSetStatusModerator {
	value: {
		command: string;
		offerId: string;
		emailCreator: string;
		emailCustomer: string;
	};
}

export interface IApiBodyExamplesSetStatus extends ExamplesObject {
	'from customer': IExamplesSetStatusCustomer;
	'from moderator': IExamplesSetStatusModerator;
}
