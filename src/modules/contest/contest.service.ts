import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OfferStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import {
	CustomerContestResDto,
	DataForContestDto,
	DataForContestResDto,
	QueryCustomerContestsDto,
} from '../../common/dto/contest';
import { ICharacterisricForDataContest } from '../../common/interfaces/contest';
import { AppErrors } from '../../common/errors';

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

	public async getCustomerContests(
		id: number,
		query: QueryCustomerContestsDto,
	): Promise<CustomerContestResDto> {
		try {
			const { status, limit, offset }: QueryCustomerContestsDto = query;
			const queryContest: Prisma.ContestFindManyArgs = {
				where: { userId: id, status },
				orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
				select: {
					id: true,
					title: true,
					contestType: true,
					typeOfName: true,
					brandStyle: true,
					typeOfTagline: true,
					createdAt: true,
					price: true,
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
			const [contests, totalCount]: [contests: any, totalCount: number] =
				await this.prisma.$transaction([
					this.prisma.contest.findMany({
						...queryContest,
						take: +limit,
						skip: +offset,
					}),
					this.prisma.contest.count({ where: queryContest.where }),
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
}
