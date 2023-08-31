import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	ParseIntPipe,
	Patch,
	Post,
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
	ApiResponse,
	ApiTags,
	ApiUnauthorizedResponse,
	refs,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { OfferService } from './offer.service';
import {
	BadRequestExceptionResDto,
	ForbiddenExceptionResDto,
	InternalServerErrorExceptionResDto,
	UnauthorizedExceptionResDto,
} from '../../common/dto/exception';
import { Paginate, Roles, UserId, UserRole } from '../../decorators';
import { Role } from '@prisma/client';
import { JWTAuthGuard, RolesGuard } from '../../guards';
import { imageStorage } from '../file/file.storage';
import { OneFileInterceptor } from '../../interceptors';
import {
	OfferDataDto,
	CreateOfferDto,
	CreateOfferResDto,
	DeleteOfferResDto,
	SetOfferStatusFromCustomerDto,
	OfferUpdateDto,
	SetOfferStatusFromModeratorDto,
	QueryGetOffersDto,
	OffersResDto,
	OfferForModeratorRsDto,
} from '../../common/dto/offer';
import { AppMessages } from '../../common/messages';
import { OfferConstants } from '../../common/constants';
import { IPagination } from '../../common/interfaces/pagination';

@ApiTags('offer')
@Controller('offer')
export class OfferController {
	constructor(private readonly offerService: OfferService) {}

	@ApiOperation({ description: 'Create new offer' })
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
	@ApiConsumes('multipart/form-data')
	@ApiBody({ type: CreateOfferDto })
	@ApiResponse({
		status: HttpStatus.CREATED,
		type: CreateOfferResDto,
	})
	@UseInterceptors(
		FileInterceptor('file', {
			...imageStorage,
		}),
		OneFileInterceptor,
	)
	@ApiCookieAuth()
	@Roles(Role.creator)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@Version('1')
	@Post('create')
	async create(
		@UserId() userId: number,
		@UploadedFile() file: Express.Multer.File,
		@Body() dto: CreateOfferDto | any,
	): Promise<CreateOfferResDto> {
		const offer: OfferDataDto = await this.offerService.createOffer(
			userId,
			dto,
		);
		return {
			offer,
			message: AppMessages.MSG_OFFER_CREATED,
		};
	}

	@ApiOperation({ description: 'Delete offer' })
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
		type: DeleteOfferResDto,
	})
	@ApiCookieAuth()
	@Roles(Role.creator, Role.moderator)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@Version('1')
	@Delete('delete/:id')
	async delete(
		@UserId() userId: number,
		@UserRole() role: Role,
		@Param('id', new ParseIntPipe()) id: number,
	): Promise<DeleteOfferResDto> {
		return this.offerService.deleteOffer(id, role, userId);
	}

	@ApiOperation({ description: 'Set offer status' })
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
	@ApiExtraModels(SetOfferStatusFromCustomerDto, SetOfferStatusFromModeratorDto)
	@ApiBody({
		schema: {
			anyOf: refs(
				SetOfferStatusFromCustomerDto,
				SetOfferStatusFromModeratorDto,
			),
		},
		examples: OfferConstants.API_BODY_EXAMPLES_SET_STATUS,
		description:
			'command: for moderator - "active", for customer - "reject" or "resolve"',
	})
	@ApiOkResponse({
		type: OfferUpdateDto,
	})
	@ApiCookieAuth()
	@Roles(Role.customer, Role.moderator)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@Version('1')
	@Patch('set-status')
	async setStatus(
		@UserId() userId: number,
		@UserRole() role: Role,
		@Body() dto: SetOfferStatusFromCustomerDto | SetOfferStatusFromModeratorDto,
	): Promise<OfferUpdateDto> {
		return this.offerService.setOfferStatus(dto, role, userId);
	}

	@ApiOperation({ description: 'Get all active offers' })
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
	@ApiExtraModels(OffersResDto, OfferForModeratorRsDto)
	@ApiOkResponse({
		description: 'Contests data',
		content: {
			'application/json': {
				schema: { oneOf: refs(OffersResDto, OfferForModeratorRsDto) },
				examples: {
					customer: {
						value: OfferConstants.API_OK_RESPONSE_EXAMPLES_GET_OFFERS,
					},
					creator: {
						value: OfferConstants.API_OK_RESPONSE_EXAMPLES_GET_OFFERS,
					},
					moderator: {
						value: OfferConstants.API_OK_RESPONSE_EXAMPLES_GET_OFFERS_MODERATOR,
					},
				},
			},
		},
	})
	@ApiCookieAuth()
	@Roles(Role.customer, Role.moderator, Role.creator)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@Version('1')
	@Get('')
	async getAllOffers(
		@UserId() id: number,
		@UserRole() role: Role,
		@Paginate() pagination: IPagination,
		@Query() query: QueryGetOffersDto,
	): Promise<OffersResDto | OfferForModeratorRsDto> {
		return this.offerService.getOffers(id, role, query, pagination);
	}
}
