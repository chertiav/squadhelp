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
	Version,
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiConsumes,
	ApiCookieAuth,
	ApiExtraModels,
	ApiForbiddenResponse,
	ApiInternalServerErrorResponse,
	ApiOkResponse,
	ApiOperation,
	ApiQuery,
	ApiTags,
	ApiUnauthorizedResponse,
	refs,
} from '@nestjs/swagger';

import { ContestService } from './contest.service';
import { JWTAuthGuard } from '../../guards';
import {
	BadRequestExceptionResDto,
	ForbiddenExceptionResDto,
	InternalServerErrorExceptionResDto,
	UnauthorizedExceptionResDto,
} from '../../common/dto/exception';
import { Paginate, Roles, UserId } from '../../decorators';
import { RolesGuard } from '../../guards';
import { IPagination } from '../../common/interfaces/pagination';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileStorage } from '../file/file.storage';
import { UpdateFileInterceptor } from '../../interceptors';
import { AppMessages } from '../../common/messages';
import {
	LogoDataContestResDto,
	NameDataContestResDto,
	TaglineDataContestResDto,
	QueryCreatorContestDto,
	QueryCustomerContestDto,
	QueryModeratorContestDto,
	CreatorContestsResDto,
	CustomerContestsResDto,
	ModeratorContestResDto,
	CustomerContestByIdResDto,
	CreatorContestByIdResDto,
	ModeratorContestByIdResDto,
	NameContestUpdateData,
	LogoContestUpdateDto,
	TagLineContestUpdateDto,
	CustomerUpdateContestResDto,
} from '../../common/dto/contest';
import { Role } from '@prisma/client';

@ApiTags('contest')
@Controller({ path: 'contest' })
export class ContestController {
	constructor(private readonly contestService: ContestService) {}

	@ApiOperation({ description: 'Get data for create Name contest ' })
	@ApiUnauthorizedResponse({
		description: 'Unauthorized message',
		type: UnauthorizedExceptionResDto,
	})
	@ApiInternalServerErrorResponse({
		description: 'Internal server error message',
		type: InternalServerErrorExceptionResDto,
	})
	@ApiBadRequestResponse({
		description: 'Invalid request data message',
		type: BadRequestExceptionResDto,
	})
	@ApiOkResponse({
		description: 'Data for create Name contest',
		type: NameDataContestResDto,
	})
	@ApiCookieAuth()
	@UseGuards(JWTAuthGuard)
	@Roles(Role.customer)
	@Version('1')
	@Get('cu/start/name')
	async dataNameForContest(): Promise<NameDataContestResDto> {
		return this.contestService.getDataNameForContest();
	}

	@ApiOperation({ description: 'Get data for create Logo contest ' })
	@ApiUnauthorizedResponse({
		description: 'Unauthorized message',
		type: UnauthorizedExceptionResDto,
	})
	@ApiInternalServerErrorResponse({
		description: 'Internal server error message',
		type: InternalServerErrorExceptionResDto,
	})
	@ApiBadRequestResponse({
		description: 'Invalid request data message',
		type: BadRequestExceptionResDto,
	})
	@ApiOkResponse({
		description: 'Data for create Logo contest',
		type: LogoDataContestResDto,
	})
	@ApiCookieAuth()
	@UseGuards(JWTAuthGuard)
	@Roles(Role.customer)
	@Version('1')
	@Get('cu/start/logo')
	async dataLogoForContest(): Promise<LogoDataContestResDto> {
		return this.contestService.getDataLogoForContest();
	}

	@ApiOperation({ description: 'Get data for create Tagline contest ' })
	@ApiUnauthorizedResponse({
		description: 'Unauthorized message',
		type: UnauthorizedExceptionResDto,
	})
	@ApiInternalServerErrorResponse({
		description: 'Internal server error message',
		type: InternalServerErrorExceptionResDto,
	})
	@ApiBadRequestResponse({
		description: 'Invalid request data message',
		type: BadRequestExceptionResDto,
	})
	@ApiOkResponse({
		description: 'Data for create Tagline contest',
		type: TaglineDataContestResDto,
	})
	@ApiCookieAuth()
	@UseGuards(JWTAuthGuard)
	@Roles(Role.customer)
	@Version('1')
	@Get('cu/start/tagline')
	async dataTaglineForContest(): Promise<TaglineDataContestResDto> {
		return this.contestService.getDataTaglineForContest();
	}

	@ApiOperation({ description: 'Get customer contest' })
	@ApiUnauthorizedResponse({
		description: 'Unauthorized message',
		type: UnauthorizedExceptionResDto,
	})
	@ApiInternalServerErrorResponse({
		description: 'Internal server error message',
		type: InternalServerErrorExceptionResDto,
	})
	@ApiOkResponse({
		description: 'Customer contests data',
		type: CustomerContestsResDto,
	})
	@ApiQuery({
		description: 'Query parameters',
		type: QueryCustomerContestDto,
	})
	@ApiCookieAuth()
	@Roles(Role.customer)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@Version('1')
	@Get('cu')
	async contestsForCustomer(
		@UserId() id: number,
		@Paginate() pagination: IPagination,
		@Query() query,
	): Promise<CustomerContestsResDto> {
		return this.contestService.getContestsForCustomer(id, query, pagination);
	}

	@ApiOperation({ description: 'Get all contests for creative' })
	@ApiUnauthorizedResponse({
		description: 'Unauthorized message',
		type: UnauthorizedExceptionResDto,
	})
	@ApiInternalServerErrorResponse({
		description: 'Internal server error message',
		type: InternalServerErrorExceptionResDto,
	})
	@ApiForbiddenResponse({
		description: 'Access denied message',
		type: ForbiddenExceptionResDto,
	})
	@ApiQuery({
		description: 'Query parameters',
		type: QueryCreatorContestDto,
	})
	@ApiOkResponse({
		description: 'Customer contests data',
		type: CreatorContestsResDto,
	})
	@Roles(Role.creator)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@ApiCookieAuth()
	@Version('1')
	@Get('cr')
	async contestForCreative(
		@UserId() id: number,
		@Paginate() pagination: IPagination,
		@Query() query,
	): Promise<CreatorContestsResDto> {
		return this.contestService.getContestForCreative(id, query, pagination);
	}

	@ApiOperation({ description: 'Get contests for moderator' })
	@ApiUnauthorizedResponse({
		description: 'Unauthorized message',
		type: UnauthorizedExceptionResDto,
	})
	@ApiInternalServerErrorResponse({
		description: 'Internal server error message',
		type: InternalServerErrorExceptionResDto,
	})
	@ApiForbiddenResponse({
		description: 'Access denied message',
		type: ForbiddenExceptionResDto,
	})
	@ApiQuery({
		description: 'Query parameters',
		type: QueryModeratorContestDto,
	})
	@ApiOkResponse({
		description: 'Contests data for moderator',
		type: ModeratorContestResDto,
	})
	@Roles(Role.moderator)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@ApiCookieAuth()
	@Version('1')
	@Get('mo')
	async contestsForModerator(
		@Paginate() pagination: IPagination,
		@Query() query,
	): Promise<ModeratorContestResDto> {
		return this.contestService.getContestForModerator(query, pagination);
	}

	@ApiOperation({ description: 'Get contest for customer by id' })
	@ApiUnauthorizedResponse({
		description: 'Unauthorized message',
		type: UnauthorizedExceptionResDto,
	})
	@ApiInternalServerErrorResponse({
		description: 'Internal server error message',
		type: InternalServerErrorExceptionResDto,
	})
	@ApiForbiddenResponse({
		description: 'Access denied message',
		type: ForbiddenExceptionResDto,
	})
	@ApiBadRequestResponse({
		description: 'Invalid request data message',
		type: BadRequestExceptionResDto,
	})
	@ApiOkResponse({
		description: 'Contests data for moderator',
		type: CustomerContestByIdResDto,
	})
	@Roles(Role.customer)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@ApiCookieAuth()
	@Version('1')
	@Get('cu/:contestId')
	async contestForCustomerById(
		@UserId() id: number,
		@Param('contestId', ParseIntPipe) contestId: number,
	): Promise<CustomerContestByIdResDto> {
		return this.contestService.getContestByIdForCustomer(id, contestId);
	}

	@ApiOperation({ description: 'Get contest for creator by id' })
	@ApiUnauthorizedResponse({
		description: 'Unauthorized message',
		type: UnauthorizedExceptionResDto,
	})
	@ApiInternalServerErrorResponse({
		description: 'Internal server error message',
		type: InternalServerErrorExceptionResDto,
	})
	@ApiForbiddenResponse({
		description: 'Access denied message',
		type: ForbiddenExceptionResDto,
	})
	@ApiBadRequestResponse({
		description: 'Invalid request data message',
		type: BadRequestExceptionResDto,
	})
	@ApiOkResponse({
		description: 'Contests data for moderator',
		type: CreatorContestByIdResDto,
	})
	@Roles(Role.creator)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@ApiCookieAuth()
	@Version('1')
	@Get('cr/:contestId')
	async contestForCreatorById(
		@Param('contestId', ParseIntPipe) contestId: number,
	): Promise<CreatorContestByIdResDto> {
		return this.contestService.getContestByIdForCreator(contestId);
	}

	@ApiOperation({ description: 'Get contest for moderator by id' })
	@ApiUnauthorizedResponse({
		description: 'Unauthorized message',
		type: UnauthorizedExceptionResDto,
	})
	@ApiInternalServerErrorResponse({
		description: 'Internal server error message',
		type: InternalServerErrorExceptionResDto,
	})
	@ApiForbiddenResponse({
		description: 'Access denied message',
		type: ForbiddenExceptionResDto,
	})
	@ApiBadRequestResponse({
		description: 'Invalid request data message',
		type: BadRequestExceptionResDto,
	})
	@ApiOkResponse({
		description: 'Contests data for moderator',
		type: ModeratorContestByIdResDto,
	})
	@Roles(Role.moderator)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@ApiCookieAuth()
	@Version('1')
	@Get('mo/:contestId')
	async contestForModeratorById(
		@Param('contestId', ParseIntPipe) contestId: number,
	): Promise<ModeratorContestByIdResDto> {
		return this.contestService.getContestByIdForModerator(contestId);
	}

	@ApiOperation({ description: 'Update contest' })
	@ApiUnauthorizedResponse({
		description: 'Unauthorized message',
		type: UnauthorizedExceptionResDto,
	})
	@ApiInternalServerErrorResponse({
		description: 'Internal server error message',
		type: InternalServerErrorExceptionResDto,
	})
	@ApiForbiddenResponse({
		description: 'Access denied message',
		type: ForbiddenExceptionResDto,
	})
	@ApiBadRequestResponse({
		description: 'Invalid request data message',
		type: BadRequestExceptionResDto,
	})
	@ApiOkResponse({
		description: 'Data with updated competition conditions',
		type: CustomerUpdateContestResDto,
	})
	@ApiConsumes('multipart/form-data')
	@ApiExtraModels(
		NameContestUpdateData,
		LogoContestUpdateDto,
		TagLineContestUpdateDto,
	)
	@ApiBody({
		description:
			'Contest data for update, using three different schemes - ' +
			'NameContestUpdateData, LogoContestUpdateDto, TagLineContestUpdateDto',
		type: NameContestUpdateData,
		schema: {
			oneOf: refs(
				NameContestUpdateData,
				LogoContestUpdateDto,
				TagLineContestUpdateDto,
			),
		},
	})
	@UseInterceptors(
		FileInterceptor('file', {
			...fileStorage,
		}),
		UpdateFileInterceptor,
	)
	@Roles(Role.customer)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@ApiCookieAuth()
	@Version('1')
	@Patch('cu/update/:contestId')
	async contestUpdate(
		@UserId() userId: number,
		@Param('contestId', ParseIntPipe) contestId: number,
		@UploadedFile() file: Express.Multer.File,
		@Body()
		dto: NameContestUpdateData | LogoContestUpdateDto | TagLineContestUpdateDto,
	): Promise<CustomerUpdateContestResDto> {
		const contest: CustomerContestByIdResDto =
			await this.contestService.updateContest(contestId, dto, userId);
		return { contest, message: AppMessages.MSG_CONTEST_INFORMATION_UPDATED };
	}
}
