import { ApiProperty } from '@nestjs/swagger';
import { AppErrors } from '../../../errors';

export class InternalServerErrorExceptionRes {
	@ApiProperty({
		description: 'Status code internal server error exception',
		example: 500,
	})
	status: number;
	@ApiProperty({
		description: 'Name group error exception',
		example: 'InternalServerErrorException',
	})
	name: string;
	@ApiProperty({
		description: 'Error description',
		example: AppErrors.INTERNAL_SERVER_ERROR_TRY_AGAIN_LATER,
	})
	message: string;
}
