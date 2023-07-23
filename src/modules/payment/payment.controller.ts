import {
	Body,
	Controller,
	Post,
	UploadedFiles,
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
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import {
	BadRequestExceptionResDto,
	ForbiddenExceptionResDto,
	InternalServerErrorExceptionResDto,
	UnauthorizedExceptionResDto,
} from '../../common/dto/exception';
import { JWTAuthGuard, RolesGuard } from '../../guards';
import { Roles, UserId } from '../../decorators';
import { Role } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';
import { fileStorage } from '../file/file.storage';
import { FilesPayInterceptor } from '../../interceptors';
import {
	LogoCreateContestPayDto,
	NameCreateContestPayDto,
	PayResDto,
	PayDto,
	TaglineCreateContestPayDto,
} from '../../common/dto/payment';
import { AppMessages } from '../../common/messages';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
	constructor(private readonly paymentService: PaymentService) {}

	@ApiOperation({ description: 'Deposit money for the contest' })
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
	@ApiExtraModels(
		NameCreateContestPayDto,
		LogoCreateContestPayDto,
		TaglineCreateContestPayDto,
	)
	@ApiBody({
		type: PayDto,
	})
	@ApiOkResponse({ type: PayResDto })
	@ApiCookieAuth()
	@Roles(Role.customer)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@UseInterceptors(
		FilesInterceptor('files', 3, {
			...fileStorage,
		}),
		FilesPayInterceptor,
	)
	@Version('1')
	@Post('pay')
	async pay(
		@UserId() id: number,
		@UploadedFiles() files: Array<Express.Multer.File>,
		@Body()
		dto: PayDto,
	): Promise<PayResDto> {
		const countContests: number = await this.paymentService.payment(id, dto);
		return {
			message: `${AppMessages.MSG_OPENED_NEW_CONTESTS}: ${countContests}`,
		};
	}

	@ApiOperation({ description: 'Deposit money for the contest' })
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
	//@ApiBody()
	// @ApiOkResponse()
	@ApiCookieAuth()
	@Roles(Role.creator)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@Version('1')
	@Post('cashout')
	async cashOut(@UserId() id: number): Promise<any> {
		return this.paymentService.cashOut();
	}
}
