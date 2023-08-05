import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPaginationDto {
	@ApiProperty({
		description: 'Limit on the number of contests per request',
		example: 8,
	})
	@IsNumber()
	@Min(1)
	@Max(8)
	@Type(() => Number)
	limit: number;

	@ApiProperty({
		description: 'Number of records to skip',
		example: 0,
	})
	@IsNumber()
	@Min(0)
	@Type(() => Number)
	page: number;
}
