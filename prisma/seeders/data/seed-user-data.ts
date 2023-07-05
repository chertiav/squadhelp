import { Role } from '@prisma/client';

export const seedUserData = {
	firstName: 'John',
	lastName: 'Snow',
	displayName: 'johnsnow',
	email: 'johnsnow@gmail.com',
	password: 'Johnsnow123+',
	role: Role.moderator,
};

export const seedUserDataCustomer = {
	firstName: 'Ragnar',
	lastName: 'Lodbrok',
	displayName: 'ragnarek',
	email: 'ragnar@gmail.com',
	password: 'Ragnar123+',
	role: Role.customer,
};

export const seedUserDataCreator = {
	firstName: 'Geralt',
	lastName: 'Witcher',
	displayName: 'geraltofrivia',
	email: 'witcher@gmail.com',
	password: 'Geralt123+',
	role: Role.creator,
};

export const seedUserDataCustomer_2 = {
	firstName: 'Dean',
	lastName: 'Winchester',
	displayName: 'supernatural',
	email: 'supernatural@gmail.com',
	password: 'Winchester123+',
	role: Role.customer,
};
