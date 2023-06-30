import { PublicUserDto } from '../../../dto/user';
import { ApiProperty } from '@nestjs/swagger';
import { AppMessages } from '../../../messages';

export class RegisterAuthRes {
	@ApiProperty()
	user: PublicUserDto;
	@ApiProperty()
	@ApiProperty({
		description: 'The information massage',
		example: AppMessages.MSG_REGISTER,
	})
	message: string;
}
