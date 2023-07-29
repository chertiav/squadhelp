import { FileDto } from '../file';
import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger';
import { CustomerContestByIdResDto, QueryCreatorContestDto } from '../contest';
import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsNumberString,
	IsString,
} from 'class-validator';
import { OfferStatus } from '@prisma/client';
import { InfoUserDto } from '../user';
import { AppMessages } from '../../messages';
import { OFFER_STATUS_COMMAND } from '../../enum';

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

export class OfferDataDto extends IntersectionType(
	PickType(CustomerContestByIdResDto, ['fileName', 'originalFileName']),
	PickType(CreateOfferDto, ['text']),
) {
	@IsNotEmpty()
	@ApiProperty({
		description: 'Offer ID',
		example: 1,
	})
	id: number;

	@IsEnum(OfferStatus)
	@ApiProperty({
		description: 'Offer status',
		enum: OfferStatus,
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
	offer: OfferDataDto;

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

export class SetOfferStatusDto {
	@ApiProperty({
		description: 'Contest id status command',
		required: false,
		example: '1',
	})
	contestId?: string;

	@IsNotEmpty()
	@IsEnum(OFFER_STATUS_COMMAND)
	@ApiProperty({
		description: 'Offer status command',
		enum: OFFER_STATUS_COMMAND,
		example: OFFER_STATUS_COMMAND.reject,
	})
	command: OFFER_STATUS_COMMAND;

	@IsNotEmpty()
	@ApiProperty({
		description: 'Offer id',
		example: '1',
	})
	offerId: string;

	@ApiProperty({
		description: 'Creator id',
		required: false,
		example: '3',
	})
	creatorId?: string;

	@ApiProperty({
		description: 'Contest order id',
		example: '0099108a-080d-42e4-8c0a-a693d0c0e2c0',
		required: false,
	})
	orderId?: string;

	@ApiProperty({
		description: 'Priority contest',
		example: '1',
		required: false,
	})
	priority?: string;

	@ApiProperty({
		description: 'The email address of the creator',
		example: 'witcher@gmail.com',
	})
	@IsNotEmpty()
	@IsEmail()
	email: string;
}

export class OfferUpdateDto extends PickType(OfferDataDto, [
	'id',
	'text',
	'originalFileName',
	'fileName',
	'status',
]) {}
