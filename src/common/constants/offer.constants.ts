import { ISelectFieldOffer } from '../interfaces/constants';
import {
	IApiBodyExamplesSetStatus,
	ISelectOfferDataMail,
} from '../interfaces/offer';

export const SELECT_FIELD_OFFER_DATA_MAIL: ISelectOfferDataMail = {
	originalFileName: true,
	text: true,
	user: {
		select: {
			email: true,
		},
	},
	contest: {
		select: {
			title: true,
			user: { select: { firstName: true, lastName: true } },
		},
	},
};

export const SELECT_FIELD_DELETE_OFFER_DATA_MAIL_: ISelectOfferDataMail = {
	fileName: true,
	...SELECT_FIELD_OFFER_DATA_MAIL,
};

export const SELECT_FIELD_OFFER: ISelectFieldOffer = {
	id: true,
	text: true,
	originalFileName: true,
	fileName: true,
	status: true,
};

export const API_BODY_EXAMPLES_SET_STATUS: IApiBodyExamplesSetStatus = {
	'from customer': {
		value: {
			contestId: '1',
			command: 'reject',
			offerId: '1',
			creatorId: '3',
			orderId: '0099108a-080d-42e4-8c0a-a693d0c0e2c0',
			priority: '1',
			emailCreator: 'witcher@gmail.com',
		},
	},
	'from moderator': {
		value: {
			command: 'active',
			offerId: '3',
			emailCreator: 'witcher@gmail.com',
			emailCustomer: 'ragnar@gmail.com',
		},
	},
};
