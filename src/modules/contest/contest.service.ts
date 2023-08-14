import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import {
	Contest,
	ContestStatus,
	ContestType,
	Prisma,
	Role,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AppErrors } from '../../common/errors';
import { IPagination } from '../../common/interfaces/pagination';
import { ContestConstants } from '../../common/constants';
import { FileService } from '../file/file.service';
import {
	ContestDto,
	CreatorContestByIdResDto,
	CreatorContestsResDto,
	CustomerContestByIdResDto,
	CustomerContestsResDto,
	DataContestDto,
	LogoContestUpdateDto,
	LogoDataContestResDto,
	ModeratorContestByIdResDto,
	ModeratorContestResDto,
	NameContestUpdateData,
	NameDataContestResDto,
	QueryCreatorContestDto,
	QueryCustomerContestDto,
	QueryModeratorContestDto,
	TagLineContestUpdateDto,
	TaglineDataContestResDto,
} from '../../common/dto/contest';
import {
	ICharacteristicsDataContest,
	ICreatContest,
	IQueryDataContest,
} from '../../common/interfaces/contest';
import {
	createPredicatesAllContests,
	createPredicatesOneContest,
} from '../../common/helpers';

@Injectable()
export class ContestService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly fileService: FileService,
	) {}

	public async getDataNewContest(
		contestType: ContestType,
	): Promise<
		NameDataContestResDto | LogoDataContestResDto | TaglineDataContestResDto
	> {
		switch (contestType) {
			case ContestType.name: {
				const queryData: IQueryDataContest = {
					characteristic1: 'nameStyle',
					characteristic2: 'typeOfName',
				};
				return await this.getDataForContest(queryData);
			}
			case ContestType.logo: {
				const queryData: IQueryDataContest = { characteristic1: 'brandStyle' };
				return await this.getDataForContest(queryData);
			}
			case ContestType.tagline: {
				const queryData: IQueryDataContest = {
					characteristic1: 'typeOfTagline',
				};
				return await this.getDataForContest(queryData);
			}
		}
	}

	public async getContests(
		id: number,
		role: Role,
		query:
			| QueryCustomerContestDto
			| QueryCreatorContestDto
			| QueryModeratorContestDto,
		pagination: IPagination,
	): Promise<
		CustomerContestsResDto | CreatorContestsResDto | ModeratorContestResDto
	> {
		try {
			const predicates: Prisma.ContestFindManyArgs =
				createPredicatesAllContests(id, role, query);
			const [contests, totalCount]: [
				contests: ContestDto[],
				totalCount: number,
			] = await this.prisma.$transaction([
				this.prisma.contest.findMany({
					...predicates,
					...pagination,
				}),
				this.prisma.contest.count({ where: predicates.where }),
			]);
			return {
				contests,
				totalCount,
			};
		} catch (e) {
			throw new InternalServerErrorException(
				AppErrors.INTERNAL_SERVER_ERROR_TRY_AGAIN_LATER,
				{
					cause: e,
				},
			);
		}
	}

	public async getContestById(
		id: number,
		role: Role,
		contestId: number,
	): Promise<
		| CustomerContestByIdResDto
		| CreatorContestByIdResDto
		| ModeratorContestByIdResDto
	> {
		const queryContest: Prisma.ContestFindFirstArgs =
			createPredicatesOneContest(id, role, contestId);
		const contest:
			| CustomerContestByIdResDto
			| CreatorContestByIdResDto
			| ModeratorContestByIdResDto = await this.prisma.contest.findFirst(
			queryContest,
		);
		if (!contest)
			return Promise.reject(
				new BadRequestException(AppErrors.NO_DATA_FOR_THIS_CONTEST),
			);
		return contest;
	}

	public async createContests(contests: ICreatContest[]): Promise<number> {
		try {
			const { count }: { count: number } = await this.prisma.contest.createMany(
				{ data: contests },
			);
			return count;
		} catch (e) {
			throw new InternalServerErrorException(AppErrors.ERROR_OPENING_CONTEST, {
				cause: e,
			});
		}
	}

	public async updateContest(
		contestId: number,
		dto: NameContestUpdateData | LogoContestUpdateDto | TagLineContestUpdateDto,
		userId: number,
	): Promise<CustomerContestByIdResDto> {
		try {
			const { deleteFileName, ...contestUpdateData } = dto;
			const accessCheck: boolean = await this.checkAccessUpdateContest(
				userId,
				contestId,
			);

			if (!accessCheck)
				return Promise.reject(
					new BadRequestException(AppErrors.NO_DATA_FOR_THIS_CONTEST),
				);
			const updateContest: CustomerContestByIdResDto =
				await this.prisma.$transaction(
					async (): Promise<CustomerContestByIdResDto> => {
						return this.prisma.contest.update({
							where: { id: contestId },
							data: contestUpdateData,
							select: {
								...ContestConstants.OPTIONS_GET_ONE_CONTEST,
								_count: { ...ContestConstants.OPTIONS_GET_COUNT_ACTIVE_OFFERS },
							},
						});
					},
				);
			deleteFileName && this.fileService.removeFile(deleteFileName);
			return updateContest;
		} catch (e) {
			throw new InternalServerErrorException(
				AppErrors.INTERNAL_SERVER_ERROR_TRY_AGAIN_LATER,
				{
					cause: e,
				},
			);
		}
	}

	private async checkAccessUpdateContest(
		userId: number,
		contestId: number,
	): Promise<boolean> {
		const result: Contest | null = await this.prisma.contest.findFirst({
			where: {
				id: contestId,
				userId: userId,
				status: {
					in: [ContestStatus.active, ContestStatus.pending],
				},
			},
		});
		return !!result;
	}

	private async getDataForContest(
		query: IQueryDataContest,
	): Promise<
		NameDataContestResDto | LogoDataContestResDto | TaglineDataContestResDto
	> {
		try {
			const response: DataContestDto = {
				industry: [],
			};
			const types: string[] = [
				query.characteristic1,
				query.characteristic2,
				'industry',
			].filter(Boolean);
			const characteristics: ICharacteristicsDataContest[] =
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
					new BadRequestException(AppErrors.CANNOT_GET_CONTEST_PREFERENCES),
				);
			characteristics.forEach(
				(characteristic: ICharacteristicsDataContest): void => {
					if (!response[characteristic.type]) {
						response[characteristic.type] = [];
					}
					response[characteristic.type].push(characteristic.describe);
				},
			);
			return response;
		} catch (e) {
			throw new InternalServerErrorException(
				AppErrors.INTERNAL_SERVER_ERROR_TRY_AGAIN_LATER,
				{
					cause: e,
				},
			);
		}
	}
}
