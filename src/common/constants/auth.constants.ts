import { IAuthCookiesOptions } from '../interfaces/constants';
import { IApiBodyExamplesLogin } from '../interfaces/auth';

export const AUTH_COOKIES_OPTIONS: IAuthCookiesOptions = {
	httpOnly: true,
	secure: false,
	maxAge: 24 * 60 * 60 * 1000,
};

export const API_BODY_EXAMPLES_LOGIN: IApiBodyExamplesLogin = {
	moderator: {
		value: {
			email: 'johnsnow@gmail.com',
			password: 'Johnsnow123+',
		},
	},
	customer_1: {
		value: {
			email: 'ragnar@gmail.com',
			password: 'Ragnar123+',
		},
	},
	customer_2: {
		value: {
			email: 'supernatural@gmail.com',
			password: 'Winchester123+',
		},
	},
	creator_1: {
		value: {
			email: 'witcher@gmail.com',
			password: 'Geralt123+',
		},
	},
	creator_2: {
		value: {
			email: 'sam_supernatural@gmail.com',
			password: 'Sam_winchester123+',
		},
	},
};
