import { ContestCommonQuery } from './common-query';
import { ApiProperty } from '@nestjs/swagger';
import { ContestStatus } from '@prisma/client';

export class QueryCreatorContestDto extends ContestCommonQuery {
	constructor(query) {
		super();
		this.typeIndex = query.typeIndex;
		this.contestId = query.contestId;
		this.industry = query.industry;
		this.awardSort = query.awardSort;
		this.ownEntries = query.ownEntries;
		this.status = query.status;
	}
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
