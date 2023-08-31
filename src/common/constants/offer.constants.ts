import { ISelectFieldOffer } from '../interfaces/constants';
import {
	IApiBodyExamplesSetStatus,
	ISelectOfferDataMail,
} from '../interfaces/offer';
import { OfferForModeratorRsDto, OffersResDto } from '../dto/offer';
import { API_BODY_EXAMPLES_LOGIN } from './auth.constants';

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
			emailCreator: API_BODY_EXAMPLES_LOGIN.creator_1.value.email,
		},
	},
	'from moderator': {
		value: {
			command: 'active',
			offerId: '3',
			emailCreator: API_BODY_EXAMPLES_LOGIN.creator_1.value.email,
			emailCustomer: API_BODY_EXAMPLES_LOGIN.customer_1.value.email,
		},
	},
};

export const API_OK_RESPONSE_EXAMPLES_GET_OFFERS: OffersResDto = {
	offers: [
		{
			id: 1,
			text: 'I am learning',
			fileName: null,
			originalFileName: null,
			status: 'rejected',
			user: {
				id: 3,
				firstName: 'Geralt',
				lastName: 'Witcher',
				email: API_BODY_EXAMPLES_LOGIN.creator_1.value.email,
				avatar: 'anon.png',
				rating: 2.583333333333333,
			},
			ratings: [
				{
					mark: 1.5,
				},
			],
		},
	],
	totalCount: 1,
};

export const API_OK_RESPONSE_EXAMPLES_GET_OFFERS_MODERATOR: OfferForModeratorRsDto =
	{
		offers: [
			{
				id: 6,
				text: 'I am learning',
				fileName: null,
				originalFileName: null,
				status: 'pending',
				user: {
					email: API_BODY_EXAMPLES_LOGIN.creator_1.value.email,
				},
				contest: {
					user: {
						email: API_BODY_EXAMPLES_LOGIN.customer_1.value.email,
					},
				},
			},
		],
		totalCount: 1,
	};
