export const AUTH_COOKIES_OPTIONS: {
	httpOnly: boolean;
	secure: boolean;
	maxAge: number;
} = {
	httpOnly: true,
	secure: false,
	maxAge: 24 * 60 * 60 * 1000,
};

export const SELECT_USER_FIELDS: {
	id: boolean;
	firstName: boolean;
	lastName: boolean;
	displayName: boolean;
	email: boolean;
	role: boolean;
	avatar: boolean;
} = {
	id: true,
	firstName: true,
	lastName: true,
	displayName: true,
	email: true,
	role: true,
	avatar: true,
};

export const LOG_FILE: {
	logFileName: string;
	logFilePath: string;
	logFilePathCurrentDay: string;
} = {
	logFilePath: 'logs',
	logFileName: 'errors.log',
	logFilePathCurrentDay: 'logs-current-day',
};

export const DEFAULT_AVATAR_NAME = 'anon.png';
