import { CreateUserDto, UpdateUserDto } from '../../src/common/dto/user';
import { Role } from '@prisma/client';

export const userMockDataCustomer: CreateUserDto = {
	firstName: 'Ragnar',
	lastName: 'Lodbrok',
	displayName: 'ragnarek',
	email: 'ragnartest@gmail.com',
	password: 'Ragnar123+',
	role: Role.customer,
};

export const userMockDataCreator: CreateUserDto = {
	firstName: 'Geralt',
	lastName: 'Witcher',
	displayName: 'geraltofrivia',
	email: 'witchertest@gmail.com',
	password: 'Geralt123+',
	role: Role.creator,
};

export const userUpdateMockData: UpdateUserDto = {
	firstName: 'RagnarUp',
	lastName: 'LodbrokUp',
	displayName: 'ragnarekUp',
	avatar: 'anon.png',
	deleteFileName: '',
};
