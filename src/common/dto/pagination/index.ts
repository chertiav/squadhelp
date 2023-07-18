import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, Max, Min } from 'class-validator';

export class QueryPaginationDto {
	@ApiProperty({
		description: 'Limit on the number of contests per request',
		example: 8,
	})
	@IsNumberString()
	@Min(1)
	@Max(8)
	limit: number;

	@ApiProperty({
		description: 'Number of records to skip',
		example: 0,
	})
	@IsNumberString()
	@Min(0)
	page: number;
}
