import {
	Body,
	Controller,
	HttpStatus,
	Param,
	ParseIntPipe,
	Post,
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
	ApiForbiddenResponse,
	ApiInternalServerErrorResponse,
	ApiOkResponse,
	ApiOperation,
	ApiResponse,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { OfferService } from './offer.service';
import {
	BadRequestExceptionResDto,
	ForbiddenExceptionResDto,
	InternalServerErrorExceptionResDto,
	UnauthorizedExceptionResDto,
} from '../../common/dto/exception';
import { Roles, UserId, UserRole } from '../../decorators';
import { Role } from '@prisma/client';
import { JWTAuthGuard, RolesGuard } from '../../guards';
import { imageStorage } from '../file/file.storage';
import { OneFileInterceptor } from '../../interceptors';
import {
	CreateOfferDataDto,
	CreateOfferDto,
	CreateOfferResDto,
	DeleteOfferResDto,
} from '../../common/dto/offer';
import { AppMessages } from '../../common/messages';

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
		@Body() dto: CreateOfferDto,
	): Promise<CreateOfferResDto> {
		const offer: CreateOfferDataDto = await this.offerService.createOffer(
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
	@Post('delete/:id')
	async delete(
		@UserId() userId: number,
		@UserRole() role: Role,
		@Param('id', new ParseIntPipe()) id: number,
	): Promise<DeleteOfferResDto> {
		return this.offerService.deleteOffer(id, role, userId);
	}
}
