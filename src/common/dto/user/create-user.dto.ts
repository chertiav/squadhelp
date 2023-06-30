import {
	IsEmail,
	IsNotEmpty,
	IsStrongPassword,
	Length,
	IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { UserRolesEnum } from '../../enum/user';

export class CreateUserDto {
	@ApiProperty({
		description: 'The name of the User',
		example: 'Ragnar',
	})
	@IsNotEmpty()
	firstName: string;

	@ApiProperty({
		description: 'The surname of the User',
		example: 'Lodbrok',
	})
	@IsNotEmpty()
	lastName: string;

	@ApiProperty({
		description: 'The display name of the User',
		example: 'ragnarek',
	})
	@IsNotEmpty()
	@Length(4, 10)
	displayName: string;

	@ApiProperty({
		description: 'The email address of the User',
		example: 'ragnar@gmail.com',
	})
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@ApiProperty({
		description: 'The password of the User',
		example: 'Ragnar123+',
	})
	@IsNotEmpty()
	@Length(4, 24)
	@IsStrongPassword({
		minLowercase: 1,
		minUppercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	password: string;

	@ApiProperty({
		description: `A list of user's roles`,
		enum: Object.values(UserRolesEnum),
		example: Object.values(UserRolesEnum)[1],
		isArray: false,
	})
	@IsEnum(UserRolesEnum)
	role: UserRolesEnum;
}
