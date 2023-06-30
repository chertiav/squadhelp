import { ApiProperty } from '@nestjs/swagger';

export class BadRequestExceptionRes {
	@ApiProperty({
		description: 'Status code error exception',
		example: 400,
	})
	status: number;
	@ApiProperty({
		description: 'Name group error exception',
		example: 'BadRequestException',
	})
	name: string;
	@ApiProperty({
		description: 'Error description',
		example: 'password is not strong enough',
	})
	message: string;
}
