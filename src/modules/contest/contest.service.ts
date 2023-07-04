import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import {
	DataForContestDto,
	DataForContestResDto,
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
				AppErrors.CANNOT_GET_CONTEST_PREFERENCES,
				{
					cause: e,
				},
			);
		}
	}
}
