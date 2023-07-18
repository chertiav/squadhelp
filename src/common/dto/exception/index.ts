import { ApiProperty } from '@nestjs/swagger';
import { AppErrors } from '../../errors';

export class BadRequestExceptionResDto {
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

export class ForbiddenExceptionResDto {
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

export class InternalServerErrorExceptionResDto {
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

export class UnauthorizedExceptionResDto {
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
		example: 'Unauthorized',
	})
	message: string;
}
