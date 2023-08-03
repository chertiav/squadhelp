import { IExamplesChangeRating } from '../interfaces/rating';

export const API_BODY_EXAMPLES_CHANGE_RATING: IExamplesChangeRating = {
	'first grade': {
		value: {
			offerId: '1',
			creatorId: '3',
			mark: 1.5,
			isFirst: true,
		},
	},
	'subsequent evaluations': {
		value: {
			offerId: '1',
			creatorId: '3',
			mark: 1.5,
			isFirst: false,
		},
	},
};
