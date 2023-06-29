import { CreateUserDto } from '../../src/common/dto/user';
import { UserRolesEnum } from '../../src/common/enum/user';

export const userMockData: CreateUserDto = {
	firstName: 'Ragnar',
	lastName: 'Lodbrok',
	displayName: 'ragnarek',
	email: 'ragnar@gmail.com',
	password: 'Ragnar123+',
	role: UserRolesEnum.CUSTOMER,
};
