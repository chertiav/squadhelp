import { FileDto } from '../file';
import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger';
import { CustomerContestByIdResDto, QueryCreatorContestDto } from '../contest';
import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';
import { OfferStatus } from '@prisma/client';
import { InfoUserDto } from '../user';
import { AppMessages } from '../../messages';

export class CreateOfferDto extends IntersectionType(
	PickType(FileDto, ['file']),
	PickType(QueryCreatorContestDto, ['contestId']),
) {
	@ApiProperty({
		description: 'The id of customer',
		example: 2,
	})
	customerId: number;

	@IsNumberString()
	@ApiProperty({
		required: true,
		example: 1,
	})
	contestId: number;

	@IsString()
	@ApiProperty({
		description: 'Text proposal for the competition',
		required: false,
		example: 'Text offer',
	})
	text?: string;
	fileName?: string;
	originalFileName?: string;
}

class OfferUser extends IntersectionType(
	PickType(InfoUserDto, [
		'firstName',
		'lastName',
		'displayName',
		'avatar',
	] as const),
) {
	@IsNotEmpty()
	@ApiProperty({
		description: 'User rating',
		example: 0,
	})
	rating: number;
}

export class CreateOfferDataDto extends IntersectionType(
	PickType(CustomerContestByIdResDto, ['fileName', 'originalFileName']),
	PickType(CreateOfferDto, ['text']),
) {
	@IsNotEmpty()
	@ApiProperty({
		description: 'Offer ID',
		example: 1,
	})
	id: number;
	@ApiProperty({
		description: 'Offer status',
		example: OfferStatus.pending,
	})
	@IsString()
	@IsNotEmpty()
	status: OfferStatus;

	@ApiProperty({
		description: 'User data',
	})
	user: OfferUser;
}

export class CreateOfferResDto {
	@ApiProperty({
		description: 'Offer data',
	})
	offer: CreateOfferDataDto;

	@ApiProperty({
		description: 'Success message',
		example: AppMessages.MSG_OFFER_CREATED,
	})
	message: string;
}

export class DeleteOfferResDto {
	@ApiProperty({
		description: 'Success message',
		example: AppMessages.MSG_OFFER_DELETED,
	})
	message: string;
}
