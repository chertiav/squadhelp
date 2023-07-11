import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class QueryPaginationDto {
	@ApiProperty({
		description: 'Limit on the number of contests per request',
		example: 8,
	})
	@Transform(({ value }) => Number(value))
	@IsNumber()
	@Min(1)
	@Max(8)
	limit: number;

	@ApiProperty({
		description: 'Number of records to skip',
		example: 0,
	})
	@Transform(({ value }) => Number(value))
	@IsNumber()
	@Min(0)
	offset: number;
}
