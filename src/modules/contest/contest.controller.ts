import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
	ApiCookieAuth,
	ApiInternalServerErrorResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ContestService } from './contest.service';
import { JWTAuthGuard } from '../../guards';
import {
	InternalServerErrorExceptionRes,
	UnauthorizedExceptionRes,
} from '../../common/types/response/exception';
import {
	DataForContestDto,
	DataForContestResDto,
} from '../../common/dto/contest';

@ApiTags('contest')
@Controller('contest')
export class ContestController {
	constructor(private readonly contestService: ContestService) {}

	@ApiOperation({ description: 'Get data for contest' })
	@ApiUnauthorizedResponse({
		description: 'Unauthorized message',
		type: UnauthorizedExceptionRes,
	})
	@ApiInternalServerErrorResponse({
		description: 'Internal server error message',
		type: InternalServerErrorExceptionRes,
	})
	@ApiOkResponse({
		description: 'Data for contest',
		type: DataForContestResDto,
	})
	@ApiCookieAuth()
	@UseGuards(JWTAuthGuard)
	@Get('data-for-contest')
	async dataForContest(
		@Query() query: DataForContestDto,
	): Promise<DataForContestResDto> {
		return this.contestService.getDataForContest(query);
	}
}
