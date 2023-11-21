import { Body, Controller, Patch, UseGuards, Version } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiBearerAuth,
	ApiForbiddenResponse,
	ApiInternalServerErrorResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { RatingService } from './rating.service';
import { Roles, UserId } from '../../decorators';
import { Role } from '@prisma/client';
import { JWTAuthGuard, RolesGuard } from '../../guards';
import {
	BadRequestExceptionResDto,
	ForbiddenExceptionResDto,
	InternalServerErrorExceptionResDto,
	UnauthorizedExceptionResDto,
} from '../../common/dto/exception';
import {
	ChangeRatingDto,
	ChangeRatingResDto,
	RatingDto,
} from '../../common/dto/rating';
import { RatingConstants } from '../../common/constants';
import { AppMessages } from '../../common/messages';

@ApiTags('rating')
@Controller('rating')
export class RatingController {
	constructor(private readonly ratingService: RatingService) {}

	@ApiOperation({ description: 'Change offer rating' })
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
	@ApiBody({
		type: ChangeRatingDto,
		examples: RatingConstants.API_BODY_EXAMPLES_CHANGE_RATING,
	})
	@ApiOkResponse({ type: ChangeRatingResDto })
	@ApiBearerAuth()
	@Roles(Role.customer)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@Version('1')
	@Patch('change')
	async setStatus(
		@UserId() userId: number,
		@Body() dto: ChangeRatingDto,
	): Promise<ChangeRatingResDto> {
		const ratingData: RatingDto = await this.ratingService.changeRating(
			dto,
			userId,
		);
		return {
			ratingData,
			message: AppMessages.MSG_RATING_CHANGE,
		};
	}
}
