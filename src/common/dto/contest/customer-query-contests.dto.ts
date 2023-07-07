import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContestStatus } from '@prisma/client';
import { QueryPagination } from '../query';

export class CustomerQueryContestsDto extends QueryPagination {
	@ApiProperty({
		description: 'Contest status',
		example: ContestStatus.active,
	})
	@IsString()
	@IsNotEmpty()
	status: ContestStatus;
}
