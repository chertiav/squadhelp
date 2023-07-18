import {
	ISelectPublicUserOptions,
	ISelectUserFields,
} from '../interfaces/constants';

export const SELECT_PUBLIC_USERS_OPTIONS: ISelectPublicUserOptions = {
	id: true,
	displayName: true,
	role: true,
	avatar: true,
};

export const SELECT_USER_FIELDS: ISelectUserFields = {
	...SELECT_PUBLIC_USERS_OPTIONS,
	firstName: true,
	lastName: true,
	email: true,
};
