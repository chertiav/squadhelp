import { ApiProperty } from '@nestjs/swagger';
import { AppMessages } from '../../../messages';

export class LogoutAuthRes {
	@ApiProperty({
		description: 'Logout message',
		example: AppMessages.MSG_LOGGED_OUT,
	})
	message: string;
}
