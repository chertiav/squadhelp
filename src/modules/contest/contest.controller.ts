import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Query,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiConsumes,
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
	BadRequestExceptionRes,
	ForbiddenExceptionRes,
	InternalServerErrorExceptionRes,
	UnauthorizedExceptionRes,
} from '../../common/types/response/exception';
import {
	ContestCreatorByIdResDto,
	ContestCustomerByIdResDto,
	ContestModeratorByIdResDto,
	ContestModeratorResDto,
	ContestResDto,
} from '../../common/dto/contest';
import { Paginate, Roles, UserId } from '../../decorators';
import { UserRolesEnum } from '../../common/enum/user';
import { RolesGuard } from '../../guards/roles.guard';
import { IPagination } from '../../common/interfaces/middleware';
import {
	DataForContestDto,
	DataForContestResDto,
} from '../../common/dto/contest/data';
import {
	QueryCreatorContestDto,
	QueryCustomerContestDto,
	QueryModeratorContestDto,
} from '../../common/dto/contest/query';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileStorage } from '../file/file.storage';
import { UpdateFileInterceptor } from '../../interceptors';
import { AppMessages } from '../../common/messages';
import { ContestUpdateDto } from '../../common/dto/contest/contest-update.dto';
import { ContestUpdateResDto } from '../../common/dto/contest/contest-update.res.dto';

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
		type: QueryCustomerContestDto,
	})
	@ApiCookieAuth()
	@Roles(UserRolesEnum.CUSTOMER)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@Get('for-customer')
	async contestsForCustomer(
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
		type: QueryCreatorContestDto,
	})
	@ApiOkResponse({
		description: 'Customer contests data',
		type: ContestResDto,
	})
	@Roles(UserRolesEnum.CREATOR)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@ApiCookieAuth()
	@Get('for-creator')
	async contestForCreative(
		@UserId() id: number,
		@Paginate() pagination: IPagination,
		@Query() query,
	): Promise<ContestResDto> {
		return this.contestService.getContestForCreative(id, query, pagination);
	}

	@ApiOperation({ description: 'Get contests for moderator' })
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
		type: QueryModeratorContestDto,
	})
	@ApiOkResponse({
		description: 'Contests data for moderator',
		type: ContestModeratorResDto,
	})
	@Roles(UserRolesEnum.MODERATOR)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@ApiCookieAuth()
	@Get('for-moderator')
	async contestsForModerator(
		@Paginate() pagination: IPagination,
		@Query() query,
	): Promise<ContestModeratorResDto> {
		return this.contestService.getContestForModerator(query, pagination);
	}

	@ApiOperation({ description: 'Get contest for customer by id' })
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
	@ApiBadRequestResponse({
		description: 'Invalid request data message',
		type: BadRequestExceptionRes,
	})
	@ApiOkResponse({
		description: 'Contests data for moderator',
		type: ContestCustomerByIdResDto,
	})
	@Roles(UserRolesEnum.CUSTOMER)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@ApiCookieAuth()
	@Get('for-customer/:contestId')
	async contestForCustomerById(
		@UserId() id: number,
		@Param('contestId', ParseIntPipe) contestId: number,
	): Promise<ContestCustomerByIdResDto> {
		return this.contestService.getContestByIdForCustomer(id, contestId);
	}

	@ApiOperation({ description: 'Get contest for creator by id' })
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
	@ApiBadRequestResponse({
		description: 'Invalid request data message',
		type: BadRequestExceptionRes,
	})
	@ApiOkResponse({
		description: 'Contests data for moderator',
		type: ContestCreatorByIdResDto,
	})
	@Roles(UserRolesEnum.CREATOR)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@ApiCookieAuth()
	@Get('for-creator/:contestId')
	async contestForCreatorById(
		@Param('contestId', ParseIntPipe) contestId: number,
	): Promise<ContestCreatorByIdResDto> {
		return this.contestService.getContestByIdForCreator(contestId);
	}

	@ApiOperation({ description: 'Get contest for moderator by id' })
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
	@ApiBadRequestResponse({
		description: 'Invalid request data message',
		type: BadRequestExceptionRes,
	})
	@ApiOkResponse({
		description: 'Contests data for moderator',
		type: ContestModeratorByIdResDto,
	})
	@Roles(UserRolesEnum.MODERATOR)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@ApiCookieAuth()
	@Get('for-moderator/:contestId')
	async contestForModeratorById(
		@Param('contestId', ParseIntPipe) contestId: number,
	): Promise<ContestModeratorByIdResDto> {
		return this.contestService.getContestByIdForModerator(contestId);
	}

	@ApiOperation({ description: 'Update contest' })
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
	@ApiBadRequestResponse({
		description: 'Invalid request data message',
		type: BadRequestExceptionRes,
	})
	@ApiOkResponse({
		description: 'Data with updated competition conditions',
		type: ContestUpdateResDto,
	})
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'Contest data for update',
		type: ContestUpdateDto,
	})
	@UseInterceptors(
		FileInterceptor('file', {
			...fileStorage,
		}),
		UpdateFileInterceptor,
	)
	@Roles(UserRolesEnum.CUSTOMER)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@ApiCookieAuth()
	@Patch('update')
	async contestUpdate(
		@UserId() userId: number,
		@UploadedFile() file: Express.Multer.File,
		@Body() dto: ContestUpdateDto,
	): Promise<ContestUpdateResDto> {
		const contest: any = await this.contestService.updateContest(dto, userId);
		return { contest, message: AppMessages.MSG_CONTEST_INFORMATION_UPDATED };
	}
}
