export const AUTH_COOKIES_OPTIONS = {
	httpOnly: true,
	secure: false,
	maxAge: 24 * 60 * 60 * 1000,
};

export const SELECT_USER_FIELDS = {
	id: true,
	firstName: true,
	lastName: true,
	displayName: true,
	email: true,
	role: true,
	avatar: true,
};

export const LOG_FILE = {
	logFilePath: 'logs',
	logFileName: 'errors.log',
	logFilePathCurrentDay: 'logs-current-day',
};

export const DEFAULT_AVATAR_NAME = 'anon.png';
