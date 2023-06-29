import { SetMetadata } from '@nestjs/common';
import { UserRolesEnum } from '../common/enum/user';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRolesEnum[]) =>
	SetMetadata(ROLES_KEY, roles);
