import { ApiProperty, PickType } from '@nestjs/swagger';

import { CreateUserDto, PublicUserDto } from '../user';
import { AppMessages } from '../../messages';

export class RegisterAuthDto extends CreateUserDto {}

export class RegisterAuthResDto {
	@ApiProperty()
	user: PublicUserDto;

	@ApiProperty({
		description: 'The information massage',
		example: AppMessages.MSG_REGISTER,
	})
	message: string;
}

export class LoginAuthDto extends PickType(CreateUserDto, [
	'email',
	'password',
] as const) {}

export class LoginAuthResDto extends RegisterAuthResDto {
	@ApiProperty({
		description: 'The information massage',
		example: AppMessages.MSG_LOGGED_IN,
	})
	message: string;
}

export class LoginCheckAuthResDto extends PublicUserDto {}

export class LogoutAuthResDto {
	@ApiProperty({
		description: 'Logout message',
		example: AppMessages.MSG_LOGGED_OUT,
	})
	message: string;
}
