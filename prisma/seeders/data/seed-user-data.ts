import { Role } from '@prisma/client';

export const seedUserData = {
	firstName: 'John',
	lastName: 'Snow',
	displayName: 'johnsnow',
	email: 'johnsnow@gmail.com',
	password: 'Johnsnow123+',
	role: Role.moderator,
};
