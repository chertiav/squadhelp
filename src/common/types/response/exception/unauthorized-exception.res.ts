import { ApiProperty } from '@nestjs/swagger';

export class UnauthorizedExceptionRes {
	@ApiProperty({
		description: 'Status code unauthorized error',
		example: 401,
	})
	status: number;
	@ApiProperty({
		description: 'Name group error exception',
		example: 'UnauthorizedException',
	})
	name: string;
	@ApiProperty({
		description: 'Error description',
		example: 'Wrong login or password',
	})
	message: string;
}
