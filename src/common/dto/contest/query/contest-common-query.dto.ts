import { ApiProperty } from '@nestjs/swagger';
import { QueryPaginationDto } from '../../pagination';

export class ContestCommonQueryDto extends QueryPaginationDto {
	@ApiProperty({
		description: 'Filter by type',
		example: '1',
	})
	typeIndex: string;

	@ApiProperty({
		description: 'Filter by contest id',
		required: false,
		example: '',
	})
	contestId: string;

	@ApiProperty({
		description: 'Filter by industry',
		required: false,
		example: '',
	})
	industry: string;
}
