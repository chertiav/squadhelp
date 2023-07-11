import { ApiProperty } from '@nestjs/swagger';
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
		example: 'Forbidden resource or message with exception description',
	})
	message: string;
}
