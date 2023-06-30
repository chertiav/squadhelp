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
