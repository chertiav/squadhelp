import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
	ApiCookieAuth,
	ApiForbiddenResponse,
	ApiInternalServerErrorResponse,
	ApiOkResponse,
	ApiOperation,
	ApiQuery,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ContestService } from './contest.service';
import { JWTAuthGuard } from '../../guards';
import {
	ForbiddenExceptionRes,
	InternalServerErrorExceptionRes,
	UnauthorizedExceptionRes,
} from '../../common/types/response/exception';
import {
	ContestResDto,
	DataForContestDto,
	DataForContestResDto,
	CustomerQueryContestsDto,
} from '../../common/dto/contest';
import { Paginate, Roles, UserId } from '../../decorators';
import { UserRolesEnum } from '../../common/enum/user';
import { RolesGuard } from '../../guards/roles.guard';
import { IPagination } from '../../common/interfaces/middleware';
import { CreatorQueryContestDto } from '../../common/dto/contest/creator-query-contest.dto';

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
	@Get('data')
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
		type: ContestResDto,
	})
	@ApiQuery({
		description: 'Query parameters',
		type: CustomerQueryContestsDto,
	})
	@ApiCookieAuth()
	@Roles(UserRolesEnum.CUSTOMER)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@Get('customer')
	async customerContests(
		@UserId() id: number,
		@Paginate() pagination: IPagination,
		@Query() query,
	): Promise<ContestResDto> {
		return this.contestService.getContestsForCustomer(id, query, pagination);
	}

	@ApiOperation({ description: 'Get all contests for creative' })
	@ApiUnauthorizedResponse({
		description: 'Unauthorized message',
		type: UnauthorizedExceptionRes,
	})
	@ApiInternalServerErrorResponse({
		description: 'Internal server error message',
		type: InternalServerErrorExceptionRes,
	})
	@ApiForbiddenResponse({
		description: 'Access denied message',
		type: ForbiddenExceptionRes,
	})
	@ApiQuery({
		description: 'Query parameters',
		type: CreatorQueryContestDto,
	})
	@ApiOkResponse({
		description: 'Customer contests data',
		type: ContestResDto,
	})
	@Roles(UserRolesEnum.CREATOR)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@ApiCookieAuth()
	@Get('creator')
	async contestsForCreative(
		@UserId() id: number,
		@Paginate() pagination: IPagination,
		@Query() query,
	): Promise<ContestResDto> {
		return this.contestService.getContestForCreative(id, query, pagination);
	}
}
