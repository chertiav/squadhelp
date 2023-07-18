import { CreateUserDto } from '../../src/common/dto/user';
import { Role } from '@prisma/client';

export const userMockData: CreateUserDto = {
	firstName: 'Ragnar',
	lastName: 'Lodbrok',
	displayName: 'ragnarek',
	email: 'ragnar@gmail.com',
	password: 'Ragnar123+',
	role: Role.customer,
};
