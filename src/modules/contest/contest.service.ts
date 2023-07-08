import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Contest, ContestStatus, OfferStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import {
	ContestResDto,
	DataForContestDto,
	DataForContestResDto,
	ContestModeratorResDto,
	QueryCustomerContestDto,
	QueryCreatorContestDto,
	QueryModeratorContestDto,
} from '../../common/dto/contest';
import { ICharacterisricForDataContest } from '../../common/interfaces/contest';
import { AppErrors } from '../../common/errors';
import { IPagination } from '../../common/interfaces/middleware';
import { parsBool } from '../../utils';
import {
	CONTEST_TYPE,
	OPTIONS_CONTEST_MODERATOR,
	OPTIONS_GET_ALL_CONTESTS,
} from '../../common/constants';

@Injectable()
export class ContestService {
	constructor(private readonly prisma: PrismaService) {}

	public async getDataForContest(
		query: DataForContestDto,
	): Promise<DataForContestResDto> {
		try {
			const response: object = {};
			const { characteristic1, characteristic2 }: DataForContestDto = query;
			const types: string[] = [
				characteristic1,
				characteristic2,
				'industry',
			].filter(Boolean);
			const characteristics: ICharacterisricForDataContest[] =
				await this.prisma.selectBox.findMany({
					where: {
						type: {
							in: types,
						},
					},
					select: {
						type: true,
						describe: true,
					},
				});
			if (!characteristics)
				return Promise.reject(
					new InternalServerErrorException(
						AppErrors.CANNOT_GET_CONTEST_PREFERENCES,
					),
				);
			characteristics.forEach(
				(characteristic: ICharacterisricForDataContest): void => {
					if (!response[characteristic.type]) {
						response[characteristic.type] = [];
					}
					response[characteristic.type].push(characteristic.describe);
				},
			);
			return response as DataForContestResDto;
		} catch (e) {
			throw new InternalServerErrorException(
				AppErrors.INTERNAL_SERVER_ERROR_TRY_AGAIN_LATER,
				{
					cause: e,
				},
			);
		}
	}

	public async getContestsForCustomer(
		id: number,
		query: QueryCustomerContestDto,
		pagination: IPagination,
	): Promise<ContestResDto> {
		try {
			const status: ContestStatus = query.status;
			const queryContest: Prisma.ContestFindManyArgs = {
				where: { userId: id, status },
				orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
				select: {
					...OPTIONS_GET_ALL_CONTESTS,
					_count: {
						select: {
							offers: {
								where: {
									status: OfferStatus.active,
								},
							},
						},
					},
				},
			};
			return Object.assign(
				{} as ContestResDto,
				await this.findManyContestsWidthQuery(queryContest, pagination),
			);
		} catch (e) {
			throw new InternalServerErrorException(
				AppErrors.INTERNAL_SERVER_ERROR_TRY_AGAIN_LATER,
				{
					cause: e,
				},
			);
		}
	}

	public async getContestForCreative(
		id: number,
		query: QueryCreatorContestDto,
		pagination: IPagination,
	): Promise<ContestResDto> {
		try {
			const queryToPredicate: QueryCreatorContestDto =
				new QueryCreatorContestDto(query);
			const predicates: Prisma.ContestFindManyArgs =
				this.createPredicatesAllContests(id, queryToPredicate);
			const queryContest: Prisma.ContestFindManyArgs = {
				where: predicates.where,
				orderBy: predicates.orderBy,
				select: {
					...OPTIONS_GET_ALL_CONTESTS,
					_count: {
						select: {
							offers: {
								where: {
									status: OfferStatus.active,
									userId: parsBool(query.ownEntries) ? id : {},
								},
							},
						},
					},
				},
			};
			return Object.assign(
				{} as ContestResDto,
				await this.findManyContestsWidthQuery(queryContest, pagination),
			);
		} catch (e) {
			throw new InternalServerErrorException(
				AppErrors.INTERNAL_SERVER_ERROR_TRY_AGAIN_LATER,
				{
					cause: e,
				},
			);
		}
	}

	public async getContestForModerator(
		query: QueryModeratorContestDto,
		pagination: IPagination,
	): Promise<ContestModeratorResDto> {
		try {
			const queryToPredicate: QueryModeratorContestDto =
				new QueryModeratorContestDto(query);
			const predicates: Prisma.ContestFindManyArgs =
				this.createPredicatesAllContests(null, queryToPredicate);
			const queryContest: Prisma.ContestFindManyArgs = {
				where: predicates.where,
				orderBy: predicates.orderBy,
				select: {
					...OPTIONS_CONTEST_MODERATOR,
					_count: {
						select: {
							offers: {
								where: {
									status: OfferStatus.pending,
								},
							},
						},
					},
				},
			};
			return Object.assign(
				{} as ContestModeratorResDto,
				await this.findManyContestsWidthQuery(queryContest, pagination),
			);
		} catch (e) {
			throw new InternalServerErrorException(
				AppErrors.INTERNAL_SERVER_ERROR_TRY_AGAIN_LATER,
				{
					cause: e,
				},
			);
		}
	}

	private async findManyContestsWidthQuery(
		queryContest: Prisma.ContestFindManyArgs,
		pagination: IPagination,
	): Promise<{ contests: Partial<Contest>[]; totalCount: number }> {
		const [contests, totalCount]: [
			contests: Partial<Contest>[],
			totalCount: number,
		] = await this.prisma.$transaction([
			this.prisma.contest.findMany({
				...queryContest,
				...pagination,
			}),
			this.prisma.contest.count({ where: queryContest.where }),
		]);
		return {
			contests,
			totalCount,
		};
	}

	private createPredicatesAllContests(
		id: number,
		query: QueryCreatorContestDto | QueryModeratorContestDto,
	): Prisma.ContestFindManyArgs {
		const predicates: { where: object; orderBy: any[] } = {
			where: {},
			orderBy: [],
		};
		const statusDefault: ContestStatus[] = [
			ContestStatus.finished,
			ContestStatus.active,
		];
		query instanceof QueryModeratorContestDto &&
			Object.assign(predicates.where, {
				status: ContestStatus.active,
				offers: { some: { status: OfferStatus.pending } },
			});

		if (query instanceof QueryCreatorContestDto) {
			parsBool(query.status)
				? Object.assign(predicates.where, { status: query.status })
				: Object.assign(predicates.where, { status: { in: statusDefault } });
			parsBool(query.ownEntries) &&
				Object.assign(predicates.where, { offers: { some: { userId: id } } });
			parsBool(query.awardSort) &&
				predicates.orderBy.push({ price: query.awardSort });
		}

		parsBool(query.typeIndex) &&
			Object.assign(predicates.where, {
				contestType: this.getPredicateTypes(query.typeIndex),
			});
		parsBool(query.contestId) &&
			!isNaN(parseInt(query.contestId)) &&
			Object.assign(predicates.where, { id: +query.contestId });
		parsBool(query.industry) &&
			Object.assign(predicates.where, { industry: query.industry });

		predicates.orderBy.push({ createdAt: 'desc' }, { id: 'desc' });

		return predicates as Prisma.ContestFindManyArgs;
	}

	private getPredicateTypes(index: string): { in: string[] } {
		return { in: CONTEST_TYPE[index].split(',') };
	}
}
