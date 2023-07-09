import { ContestCommonQueryDto } from './index';

export class QueryModeratorContestDto extends ContestCommonQueryDto {
	constructor(query) {
		super();
		this.typeIndex = query.typeIndex;
		this.contestId = query.contestId;
		this.industry = query.industry;
	}
}
