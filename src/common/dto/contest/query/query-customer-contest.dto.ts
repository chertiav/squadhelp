import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContestStatus } from '@prisma/client';
import { QueryPaginationDto } from '../../pagination';

export class QueryCustomerContestDto extends QueryPaginationDto {
	@ApiProperty({
		description: 'Contest status',
		example: ContestStatus.active,
	})
	@IsString()
	@IsNotEmpty()
	status: ContestStatus;
}
