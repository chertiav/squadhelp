import { ApiProperty, PickType } from '@nestjs/swagger';

import { CreateUserDto } from '../user';
import { AppMessages } from '../../messages';

export class RegisterAuthDto extends CreateUserDto {}

export class RegisterAuthResDto {
	@ApiProperty({
		description: 'The acces token ',
		example:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJkaXNwbGF5TmFtZSI6ImpvaG5zbm93Iiwicm9sZSI6Im1vZGVyYXRvciIsImF2YXRhciI6ImFub24ucG5nIn0sImlhdCI6MTY5OTk2NjQyNiwiZXhwIjoxNjk5OTY3MzI2fQ.MsMGwrrzCeCjpr6ISh-Bn6lt7gDYLVW99YuzUr_KAGg',
	})
	accessToken: string;

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

export class LogoutAuthResDto {
	@ApiProperty({
		description: 'Logout message',
		example: AppMessages.MSG_LOGGED_OUT,
	})
	message: string;
}
