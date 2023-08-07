import { Role } from '@prisma/client';

export const seedUserData: {
	firstName: string;
	lastName: string;
	displayName: string;
	email: string;
	password: string;
	role: Role;
} = {
	firstName: 'John',
	lastName: 'Snow',
	displayName: 'johnsnow',
	email: 'johnsnowtest@gmail.com',
	password: 'Johnsnow123+',
	role: Role.moderator,
};
