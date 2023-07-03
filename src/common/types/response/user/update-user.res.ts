import { ApiProperty } from '@nestjs/swagger';
import { InfoUserDto } from '../../../dto/user';
import { AppMessages } from '../../../messages';

export class UpdateUserRes {
	@ApiProperty()
	user: InfoUserDto;

	@ApiProperty({
		description: 'Success message',
		example: AppMessages.MSG_USER_INFORMATION_UPDATED,
	})
	message: string;
}
