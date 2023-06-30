import { RegisterAuthRes } from './register-auth.res';
import { ApiProperty } from '@nestjs/swagger';
import { AppMessages } from '../../../messages';

export class LoginAuthRes extends RegisterAuthRes {
	@ApiProperty()
	@ApiProperty({
		description: 'The information massage',
		example: AppMessages.MSG_LOGGED_IN,
	})
	message: string;
}
