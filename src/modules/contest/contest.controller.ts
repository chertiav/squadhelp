import {
	Body,
	Controller,
	Get,
	Param,
	ParseEnumPipe,
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
	ApiParam,
	ApiQuery,
	ApiTags,
	ApiUnauthorizedResponse,
	refs,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { ContestType, Role } from '@prisma/client';
import { ContestService } from './contest.service';
import { JWTAuthGuard } from '../../guards';
import {
	BadRequestExceptionResDto,
	ForbiddenExceptionResDto,
	InternalServerErrorExceptionResDto,
	UnauthorizedExceptionResDto,
} from '../../common/dto/exception';
import { Paginate, Roles, UserId, UserRole } from '../../decorators';
import { RolesGuard } from '../../guards';
import { IPagination } from '../../common/interfaces/pagination';
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
import { ContestConstants } from '../../common/constants';

@ApiTags('contest')
@Controller({ path: 'contest' })
export class ContestController {
	constructor(private readonly contestService: ContestService) {}

	@ApiOperation({ description: 'Get data for create contest ' })
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
	@ApiExtraModels(
		NameDataContestResDto,
		LogoDataContestResDto,
		TaglineDataContestResDto,
	)
	@ApiOkResponse({
		description: 'Data for create Name contest',
		content: {
			'application/json': {
				schema: {
					oneOf: refs(
						NameDataContestResDto,
						LogoDataContestResDto,
						TaglineDataContestResDto,
					),
				},
				examples: {
					name: {
						value:
							ContestConstants.GET_DATA_CONTEST_API_OK_RESPONSE_EXAMPLES_NAME,
					},
					logo: {
						value:
							ContestConstants.GET_DATA_CONTEST_API_OK_RESPONSE_EXAMPLES_LOGO,
					},
					tagline: {
						value:
							ContestConstants.GET_DATA_CONTEST_API_OK_RESPONSE_EXAMPLES_TAG_LINE,
					},
				},
			},
		},
	})
	@ApiParam({
		name: 'contestType',
		description: 'The name of the type of competition to receive data',
		enum: ContestType,
	})
	@ApiCookieAuth()
	@UseGuards(JWTAuthGuard)
	@Roles(Role.customer)
	@Version('1')
	@Get('start/:contestType')
	async dataNewContest(
		@Param('contestType', new ParseEnumPipe(ContestType))
		contestType: ContestType,
	): Promise<
		NameDataContestResDto | LogoDataContestResDto | TaglineDataContestResDto
	> {
		return this.contestService.getDataNewContest(contestType);
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
	@ApiExtraModels(
		QueryCustomerContestDto,
		QueryCreatorContestDto,
		QueryModeratorContestDto,
		CustomerContestsResDto,
		CreatorContestsResDto,
		ModeratorContestResDto,
	)
	@ApiOkResponse({
		description: 'Contests data',
		content: {
			'application/json': {
				schema: {
					oneOf: refs(
						CustomerContestsResDto,
						CreatorContestsResDto,
						ModeratorContestResDto,
					),
				},
				examples: {
					customer: {
						value:
							ContestConstants.API_OK_RESPONSE_EXAMPLES_GET_CONTESTS_CUSTOMER,
					},
					creator: {
						value:
							ContestConstants.API_OK_RESPONSE_EXAMPLES_GET_CONTESTS_CREATOR,
					},
					moderator: {
						value:
							ContestConstants.API_OK_RESPONSE_EXAMPLES_GET_CONTESTS_MODERATOR,
					},
				},
			},
		},
	})
	@ApiQuery({
		description: 'Query parameters for customers, creators, moderators',
		name: 'query',
		style: 'form',
		schema: {
			allOf: refs(
				QueryCustomerContestDto,
				QueryCreatorContestDto,
				QueryModeratorContestDto,
			),
		},
		examples: {
			customer: ContestConstants.API_QUERY_EXAMPLES_GET_CONTESTS_CUSTOMER,
			creator: ContestConstants.API_QUERY_EXAMPLES_GET_CONTESTS_CREATOR,
			moderator: ContestConstants.API_QUERY_EXAMPLES_GET_CONTESTS_MODERATOR,
		},
	})
	@ApiCookieAuth()
	@Roles(Role.customer, Role.creator, Role.moderator)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@Version('2')
	@Get()
	async contests(
		@UserId() id: number,
		@UserRole() role: Role,
		@Paginate() pagination: IPagination,
		@Query()
		query:
			| QueryCustomerContestDto
			| QueryCreatorContestDto
			| QueryModeratorContestDto,
	): Promise<
		CustomerContestsResDto | CreatorContestsResDto | ModeratorContestResDto
	> {
		return this.contestService.getContests(id, role, query, pagination);
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
