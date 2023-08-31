import { CreateUserDto, UpdateUserDto } from '../../src/common/dto/user';
import { Role } from '@prisma/client';

export const userMockDataFirstCustomer: CreateUserDto = {
	firstName: 'Firstcustomer',
	lastName: 'Firstcustomer',
	displayName: 'firstcu',
	email: 'firstcustomer@test.com',
	password: 'Firstcustomer123+',
	role: Role.customer,
};

export const userMockDataSecondCustomer: CreateUserDto = {
	firstName: 'Secondcustomer',
	lastName: 'Secondcustomer',
	displayName: 'secondcu',
	email: 'secondcustomer@test.com',
	password: 'Secondcustomer123+',
	role: Role.customer,
};

export const userMockDataFirstCreator: CreateUserDto = {
	firstName: 'Firstcreator',
	lastName: 'Firstcreator',
	displayName: 'firstcr',
	email: 'firstcreator@test.com',
	password: 'Firstcreator123+',
	role: Role.creator,
};

export const userMockDataSecondCreator: CreateUserDto = {
	firstName: 'Secondcreator',
	lastName: 'Secondcreator',
	displayName: 'secondcr',
	email: 'secondcreator@test.com',
	password: 'Secondcreator123+',
	role: Role.creator,
};

export const userUpdateMockData: UpdateUserDto = {
	firstName: 'update',
	lastName: 'Update',
	displayName: 'update',
	avatar: 'anon.png',
	deleteFileName: '',
};
