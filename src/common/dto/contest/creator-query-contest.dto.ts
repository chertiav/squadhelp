import { QueryPagination } from '../query';
import { ApiProperty } from '@nestjs/swagger';
import { ContestStatus } from '@prisma/client';

export class CreatorQueryContestDto extends QueryPagination {
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

	@ApiProperty({
		description: 'Sorting order',
		example: 'asc',
	})
	awardSort: string;

	@ApiProperty({
		description: 'Contests with own entries',
		example: 'false',
	})
	ownEntries: string;

	@ApiProperty({
		description: 'Contest status',
		required: false,
		example: ContestStatus.active,
	})
	status: ContestStatus;
}
