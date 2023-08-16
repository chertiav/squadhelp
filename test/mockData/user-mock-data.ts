import { CreateUserDto, UpdateUserDto } from '../../src/common/dto/user';
import { Role } from '@prisma/client';

export const userMockDataFirstCustomer: CreateUserDto = {
	firstName: 'Ragnar',
	lastName: 'Lodbrok',
	displayName: 'ragnarek',
	email: 'ragnartest@gmail.com',
	password: 'Ragnar123+',
	role: Role.customer,
};

export const userMockDataSecondCustomer: CreateUserDto = {
	firstName: 'Dean',
	lastName: 'Winchester',
	displayName: 'dean',
	email: 'supernaturaltest@gmail.com',
	password: 'Winchester123+',
	role: Role.customer,
};

export const userMockDataFirstCreator: CreateUserDto = {
	firstName: 'Geralt',
	lastName: 'Witcher',
	displayName: 'witcher',
	email: 'witchertest@gmail.com',
	password: 'Geralt123+',
	role: Role.creator,
};

export const userMockDataSecondCreator: CreateUserDto = {
	firstName: 'Sam',
	lastName: 'Winchester',
	displayName: 'sam',
	email: 'sam_supernaturaltest@gmail.com',
	password: 'Sam_winchester123+',
	role: Role.creator,
};

export const userUpdateMockData: UpdateUserDto = {
	firstName: 'RagnarUp',
	lastName: 'LodbrokUp',
	displayName: 'ragnarekUp',
	avatar: 'anon.png',
	deleteFileName: '',
};
