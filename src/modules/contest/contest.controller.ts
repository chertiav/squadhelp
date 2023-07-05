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
	CustomerContestResDto,
	DataForContestDto,
	DataForContestResDto,
	QueryCustomerContestsDto,
} from '../../common/dto/contest';
import { UserId } from '../../decorators';

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

	@ApiOperation({ description: 'Get customer contest' })
	@ApiUnauthorizedResponse({
		description: 'Unauthorized message',
		type: UnauthorizedExceptionRes,
	})
	@ApiInternalServerErrorResponse({
		description: 'Internal server error message',
		type: InternalServerErrorExceptionRes,
	})
	@ApiOkResponse({
		description: 'Customer contests data',
		type: CustomerContestResDto,
	})
	@ApiCookieAuth()
	@UseGuards(JWTAuthGuard)
	@Get('customer-contests')
	async customerContests(
		@UserId() id: number,
		@Query() query: QueryCustomerContestsDto,
	): Promise<CustomerContestResDto> {
		return this.contestService.getCustomerContests(id, query);
	}
}
