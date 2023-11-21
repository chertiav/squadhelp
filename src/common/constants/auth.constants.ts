import { IAuthCookiesOptions } from '../interfaces/constants';
import {
	IApiBodyExamplesLogin,
	IApiBodyExamplesRegister,
} from '../interfaces/auth';
import { Role } from '@prisma/client';
import { seedUserDataModerator } from '../../../prisma/seeders/data';

export const AUTH_COOKIES_OPTIONS: IAuthCookiesOptions = {
	httpOnly: true,
	sameSite: 'none',
	secure: true,
	maxAge: 7 * 24 * 60 * 60 * 1000,
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
			displayName: 'dean',
			email: 'supernaturaltest@gmail.com',
			password: 'Winchester123+',
			role: Role.customer,
		},
	},
	creator_1: {
		value: {
			firstName: 'Geralt',
			lastName: 'Witcher',
			displayName: 'witcher',
			email: 'witchertest@gmail.com',
			password: 'Geralt123+',
			role: Role.creator,
		},
	},
	creator_2: {
		value: {
			firstName: 'Sam',
			lastName: 'Winchester',
			displayName: 'same',
			email: 'sam_supernaturaltest@gmail.com',
			password: 'Sam_winchester123+',
			role: Role.creator,
		},
	},
};

export const API_BODY_EXAMPLES_LOGIN: IApiBodyExamplesLogin = {
	moderator: {
		value: {
			email: seedUserDataModerator.email,
			password: seedUserDataModerator.password,
		},
	},
	customer_1: {
		value: {
			email: API_BODY_EXAMPLES_REGISTER.customer_1.value.email,
			password: API_BODY_EXAMPLES_REGISTER.customer_1.value.password,
		},
	},
	customer_2: {
		value: {
			email: API_BODY_EXAMPLES_REGISTER.customer_2.value.email,
			password: API_BODY_EXAMPLES_REGISTER.customer_2.value.password,
		},
	},
	creator_1: {
		value: {
			email: API_BODY_EXAMPLES_REGISTER.creator_1.value.email,
			password: API_BODY_EXAMPLES_REGISTER.creator_1.value.password,
		},
	},
	creator_2: {
		value: {
			email: API_BODY_EXAMPLES_REGISTER.creator_2.value.email,
			password: API_BODY_EXAMPLES_REGISTER.creator_2.value.password,
		},
	},
};
