import { ContestCommonQuery } from './common-query';

export class QueryModeratorContestDto extends ContestCommonQuery {
	constructor(query) {
		super();
		this.typeIndex = query.typeIndex;
		this.contestId = query.contestId;
		this.industry = query.industry;
	}
}
