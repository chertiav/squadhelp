import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import {
	Contest,
	ContestStatus,
	ContestType,
	Industry,
	OfferStatus,
	Prisma,
	PrismaClient,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { ITXClientDenyList } from '@prisma/client/runtime/library';
import { AppErrors } from '../../common/errors';
import { IPagination } from '../../common/interfaces/pagination';
import { parsBool } from '../../utils';
import { ContestConstants } from '../../common/constants';
import { UserId } from '../../decorators';
import { FileService } from '../file/file.service';
import {
	DataContestDto,
	NameDataContestResDto,
	LogoDataContestResDto,
	TaglineDataContestResDto,
	QueryCreatorContestDto,
	QueryCustomerContestDto,
	QueryModeratorContestDto,
	ContestDto,
	ContestsResDto,
	ModeratorContestResDto,
	CreatorContestsResDto,
	CustomerContestsResDto,
	CustomerContestByIdResDto,
	CreatorContestByIdResDto,
	ModeratorContestByIdResDto,
	NameContestUpdateData,
	TagLineContestUpdateDto,
	LogoContestUpdateDto,
} from '../../common/dto/contest';
import {
	ICharacteristicsDataContest,
	ICreateBulkContest,
	IQueryDataContest,
} from '../../common/interfaces/contest';

@Injectable()
export class ContestService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly fileService: FileService,
	) {}

	public async getDataNameForContest(): Promise<NameDataContestResDto> {
		const queryData: IQueryDataContest = {
			characteristic1: 'nameStyle',
			characteristic2: 'typeOfName',
		};
		return this.getDataForContest(queryData);
	}

	public async getDataTaglineForContest(): Promise<TaglineDataContestResDto> {
		const queryData: IQueryDataContest = { characteristic1: 'typeOfTagline' };
		return this.getDataForContest(queryData);
	}

	public async getDataLogoForContest(): Promise<LogoDataContestResDto> {
		const queryData: IQueryDataContest = { characteristic1: 'brandStyle' };
		return await this.getDataForContest(queryData);
	}

	public async getContestsForCustomer(
		id: number,
		query: QueryCustomerContestDto,
		pagination: IPagination,
	): Promise<CustomerContestsResDto> {
		try {
			const status: ContestStatus[] =
				query.status === ('all' as ContestStatus)
					? [ContestStatus.active, ContestStatus.finished]
					: [query.status];
			const queryContest: Prisma.ContestFindManyArgs = {
				where: {
					userId: id,
					status: { in: status },
				},
				orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
				select: {
					...ContestConstants.OPTIONS_GET_ALL_CONTESTS,
					_count: { ...ContestConstants.OPTIONS_GET_COUNT_ACTIVE_OFFERS },
				},
			};
			return this.findManyContestsWidthQuery(queryContest, pagination);
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
	): Promise<CreatorContestsResDto> {
		try {
			const status: ContestStatus[] =
				query.status === ('all' as ContestStatus)
					? [ContestStatus.active, ContestStatus.finished]
					: [query.status];
			const queryContest: Prisma.ContestFindManyArgs = {
				where: {
					status: { in: status },
					contestType: this.getContestTypes(query.typeIndex),
					id: query.contestId ? +query.contestId : {},
					industry:
						query.industry === ('all' as Industry) ? {} : query.industry,
					offers: parsBool(query.ownEntries) ? { some: { userId: id } } : {},
				},
				orderBy: [
					{ price: query.awardSort as Prisma.SortOrder },
					{ createdAt: 'desc' },
					{ id: 'desc' },
				],
				select: {
					...ContestConstants.OPTIONS_GET_ALL_CONTESTS,
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
			return this.findManyContestsWidthQuery(queryContest, pagination);
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
	): Promise<ModeratorContestResDto> {
		try {
			const queryContest: Prisma.ContestFindManyArgs = {
				where: {
					status: ContestStatus.active,
					id: query.contestId ? +query.contestId : {},
					industry:
						query.industry === ('all' as Industry) ? {} : query.industry,
					contestType: this.getContestTypes(query.typeIndex),
					offers: { some: { status: OfferStatus.pending } },
				},
				orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
				select: {
					...ContestConstants.OPTIONS_GET_ALL_CONTESTS_MODERATOR,
					_count: { ...ContestConstants.OPTIONS_GET_COUNT_PENDING_OFFERS },
				},
			};
			return this.findManyContestsWidthQuery(queryContest, pagination);
		} catch (e) {
			throw new InternalServerErrorException(
				AppErrors.INTERNAL_SERVER_ERROR_TRY_AGAIN_LATER,
				{
					cause: e,
				},
			);
		}
	}

	public async getContestByIdForCustomer(
		@UserId() id: number,
		contestId: number,
	): Promise<CustomerContestByIdResDto> {
		const queryContest: Prisma.ContestFindFirstArgs = {
			where: { id: contestId, userId: id },
			select: {
				...ContestConstants.OPTIONS_GET_ONE_CONTEST,
				_count: { ...ContestConstants.OPTIONS_GET_COUNT_ACTIVE_OFFERS },
			},
		};
		const contest: CustomerContestByIdResDto = await this.getContestById(
			queryContest,
		);
		if (!contest)
			return Promise.reject(
				new BadRequestException(AppErrors.NO_DATA_FOR_THIS_CONTEST),
			);
		return contest;
	}

	public async getContestByIdForCreator(
		contestId: number,
	): Promise<CreatorContestByIdResDto> {
		const queryContest: Prisma.ContestFindFirstArgs = {
			where: { id: contestId },
			select: {
				...ContestConstants.OPTIONS_GET_ONE_CONTEST,
				user: {
					select: {
						firstName: true,
						lastName: true,
						displayName: true,
						avatar: true,
					},
				},
				_count: { ...ContestConstants.OPTIONS_GET_COUNT_ACTIVE_OFFERS },
			},
		};
		const contest: CreatorContestByIdResDto = await this.getContestById(
			queryContest,
		);
		if (!contest)
			return Promise.reject(
				new BadRequestException(AppErrors.NO_DATA_FOR_THIS_CONTEST),
			);
		return contest;
	}

	public async getContestByIdForModerator(
		contestId: number,
	): Promise<ModeratorContestByIdResDto> {
		const queryContest: Prisma.ContestFindFirstArgs = {
			where: {
				id: contestId,
				status: ContestStatus.active,
				offers: { some: { status: OfferStatus.pending } },
			},
			select: {
				...ContestConstants.OPTIONS_GET_ONE_CONTEST,
				price: false,
				_count: { ...ContestConstants.OPTIONS_GET_COUNT_PENDING_OFFERS },
			},
		};
		const contest: ModeratorContestByIdResDto = await this.getContestById(
			queryContest,
		);
		if (!contest)
			return Promise.reject(
				new BadRequestException(AppErrors.NO_DATA_FOR_THIS_CONTEST),
			);
		return contest;
	}

	public async createContests(contests: ICreateBulkContest): Promise<number> {
		try {
			const { count }: { count: number } = await this.prisma.contest.createMany(
				{ data: contests },
			);
			if (count)
				return Promise.reject(
					new BadRequestException(AppErrors.ERROR_OPENING_CONTEST),
				);
			return count;
		} catch (e) {
			throw new InternalServerErrorException(
				AppErrors.INTERNAL_SERVER_ERROR_TRY_AGAIN_LATER,
				{
					cause: e,
				},
			);
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
					async (
						prisma: Omit<PrismaClient, ITXClientDenyList>,
					): Promise<CustomerContestByIdResDto> => {
						return prisma.contest.update({
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

	private async getContestById(
		queryContest: Prisma.ContestFindFirstArgs,
	): Promise<Contest> {
		try {
			const contest: Contest = await this.prisma.contest.findFirst(
				queryContest,
			);
			if (!contest)
				return Promise.reject(
					new BadRequestException(AppErrors.NO_DATA_FOR_THIS_CONTEST),
				);
			return contest;
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

	private async findManyContestsWidthQuery(
		queryContest: Prisma.ContestFindManyArgs,
		pagination: IPagination,
	): Promise<ContestsResDto> {
		const [contests, totalCount]: [contests: ContestDto[], totalCount: number] =
			await this.prisma.$transaction([
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

	private getContestTypes(index: string): { in: ContestType[] } {
		return { in: index.split(',') as ContestType[] };
	}

	private async getDataForContest(
		query: IQueryDataContest,
	): Promise<DataContestDto> {
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
