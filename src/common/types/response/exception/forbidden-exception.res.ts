import { ApiProperty } from '@nestjs/swagger';
import { AppErrors } from '../../../errors';
export class ForbiddenExceptionRes {
	@ApiProperty({
		description: 'Status code error exception',
		example: 403,
	})
	status: number;
	@ApiProperty({
		description: 'Name group error exception',
		example: 'ForbiddenException',
	})
	name: string;
	@ApiProperty({
		description: 'Error description',
		example: AppErrors.USER_WRONG_LOGIN_OR_PASSWORD,
	})
	message: string;
}
