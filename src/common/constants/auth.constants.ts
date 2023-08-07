import { IAuthCookiesOptions } from '../interfaces/constants';
import {
	IApiBodyExamplesLogin,
	IApiBodyExamplesRegister,
} from '../interfaces/auth';
import { Role } from '@prisma/client';

export const AUTH_COOKIES_OPTIONS: IAuthCookiesOptions = {
	httpOnly: true,
	secure: false,
	maxAge: 24 * 60 * 60 * 1000,
};

export const API_BODY_EXAMPLES_LOGIN: IApiBodyExamplesLogin = {
	moderator: {
		value: {
			email: 'johnsnowtest@gmail.com',
			password: 'Johnsnow123+',
		},
	},
	customer_1: {
		value: {
			email: 'ragnartest@gmail.com',
			password: 'Ragnar123+',
		},
	},
	customer_2: {
		value: {
			email: 'supernaturaltest@gmail.com',
			password: 'Winchester123+',
		},
	},
	creator_1: {
		value: {
			email: 'witchertest@gmail.com',
			password: 'Geralt123+',
		},
	},
	creator_2: {
		value: {
			email: 'sam_supernaturaltest@gmail.com',
			password: 'Sam_winchester123+',
		},
	},
};

export const API_BODY_EXAMPLES_REGISTER: IApiBodyExamplesRegister = {
	customer_1: {
		value: {
			firstName: 'Ragnar',
			lastName: 'Lodbrok',
			displayName: 'ragnarek',
			email: 'ragnartest@gmail.com',
			password: 'Ragnar123+',
			role: Role.customer,
		},
	},
	customer_2: {
		value: {
			firstName: 'Dean',
			lastName: 'Winchester',
			displayName: 'supernatural',
			email: 'supernaturaltest@gmail.com',
			password: 'Winchester123+',
			role: Role.customer,
		},
	},
	creator_1: {
		value: {
			firstName: 'Geralt',
			lastName: 'Witcher',
			displayName: 'geraltofrivia',
			email: 'witchertest@gmail.com',
			password: 'Geralt123+',
			role: Role.creator,
		},
	},
	creator_2: {
		value: {
			firstName: 'Sam',
			lastName: 'Witcher',
			displayName: 'sam_supernatural',
			email: 'sam_supernaturaltest@gmail.com',
			password: 'Sam_winchester123+',
			role: Role.creator,
		},
	},
};
