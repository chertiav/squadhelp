import {
	IsEmail,
	IsNotEmpty,
	IsStrongPassword,
	Length,
	IsEnum,
} from 'class-validator';
import { UserRolesEnum } from '../../enum/user';

export class CreateUserDto {
	@IsNotEmpty()
	firstName: string;

	@IsNotEmpty()
	lastName: string;

	@IsNotEmpty()
	@Length(4, 10)
	displayName: string;

	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@Length(4, 24)
	@IsStrongPassword({
		minLowercase: 1,
		minUppercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	password: string;

	@IsEnum(UserRolesEnum)
	role: UserRolesEnum;
}
