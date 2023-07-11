import { ICreatContest } from './i-creat-contest';
import { Prisma } from '@prisma/client';

export interface ICreateBulkContest extends Prisma.ContestCreateManyInput {
	contests: ICreatContest[];
}
