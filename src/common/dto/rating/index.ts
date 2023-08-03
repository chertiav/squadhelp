import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger';
import { SetOfferStatusFromCustomerDto } from '../offer';
import { IsBoolean, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { AppMessages } from '../../messages';

export class ChangeRatingDto extends IntersectionType(
	PickType(SetOfferStatusFromCustomerDto, ['offerId', 'creatorId']),
) {
	@IsNumber()
	@IsNotEmpty()
	@Min(0)
	@Max(5)
	@ApiProperty({
		description: 'Offer mark',
		example: '1.5',
	})
	mark: number;

	@IsBoolean()
	@IsNotEmpty()
	@ApiProperty({
		description: 'First grade mark',
		enum: [true, false],
		example: true,
	})
	isFirst: boolean;
}

export class RatingDto {
	@ApiProperty({
		description: 'Creator Id',
		example: 3,
	})
	userId: number;

	@ApiProperty({
		description: 'Creator rating',
		example: '1.5',
	})
	rating: number;
}

export class ChangeRatingResDto {
	@ApiProperty({
		description: 'Rating data',
	})
	ratingData: RatingDto;

	@ApiProperty({
		description: 'Success message',
		example: AppMessages.MSG_RATING_CHANGE,
	})
	message: string;
}
