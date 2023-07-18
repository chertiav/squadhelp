import { IAuthCookiesOptions } from '../interfaces/constants';

export const AUTH_COOKIES_OPTIONS: IAuthCookiesOptions = {
	httpOnly: true,
	secure: false,
	maxAge: 24 * 60 * 60 * 1000,
};
