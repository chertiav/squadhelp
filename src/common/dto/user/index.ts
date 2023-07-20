import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger';
import {
	IsDecimal,
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsStrongPassword,
	Length,
} from 'class-validator';

import { Role } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { CommonConstants } from '../../constants';
import { AppMessages } from '../../messages';
import { FileDto } from '../file';

export class CreateUserDto {
	@ApiProperty({
		description: 'The name of the User',
		example: 'Ragnar',
	})
	@IsNotEmpty()
	readonly firstName: string;

	@ApiProperty({
		description: 'The surname of the User',
		example: 'Lodbrok',
	})
	@IsNotEmpty()
	readonly lastName: string;

	@ApiProperty({
		description: 'The display name of the User',
		example: 'ragnarek',
	})
	@IsNotEmpty()
	@Length(4, 10)
	readonly displayName: string;

	@ApiProperty({
		description: 'The email address of the User',
		example: 'ragnar@gmail.com',
	})
	@IsNotEmpty()
	@IsEmail()
	readonly email: string;

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
	readonly password: string;

	@IsEnum(Role)
	@ApiProperty({
		description: `A list of user's roles`,
		enum: Object.values(Role),
		example: Role.customer,
	})
	readonly role: Role;
}

export class PublicUserDto extends PickType(CreateUserDto, [
	'displayName',
	'role',
] as const) {
	@ApiProperty({
		description: 'The id of the User',
		example: 2,
	})
	id: number;

	@ApiProperty({
		description: 'Avatar filename',
		example: CommonConstants.DEFAULT_AVATAR_NAME,
	})
	avatar: string;
}

export class InfoUserDto extends IntersectionType(
	PublicUserDto,
	PickType(CreateUserDto, ['firstName', 'lastName', 'email'] as const),
) {}

export class UpdateUserDto extends IntersectionType(
	PickType(InfoUserDto, [
		'firstName',
		'lastName',
		'displayName',
		'avatar',
	] as const),
	FileDto,
) {}

export class UpdateUserResDto {
	@ApiProperty()
	user: InfoUserDto;

	@ApiProperty({
		description: 'Success message',
		example: AppMessages.MSG_USER_INFORMATION_UPDATED,
	})
	message: string;
}
export class BalanceUserDto {
	@IsDecimal()
	@ApiProperty({
		description: "User's balance",
		example: 100,
	})
	balance: Decimal;
}
