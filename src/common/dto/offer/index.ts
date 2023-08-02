import { FileDto } from '../file';
import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger';
import { CustomerContestByIdResDto, QueryCreatorContestDto } from '../contest';
import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsNumberString,
	IsString,
	IsUUID,
} from 'class-validator';
import { OfferStatus } from '@prisma/client';
import { InfoUserDto } from '../user';
import { AppMessages } from '../../messages';
import { OFFER_STATUS_COMMAND } from '../../enum';

export class CreateOfferDto extends IntersectionType(
	PickType(FileDto, ['file']),
	PickType(QueryCreatorContestDto, ['contestId']),
) {
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

export class OfferDataForMailDto extends OfferDataDto {
	contest: {
		title: string;
		user: { firstName: string; lastName: string };
	};
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

export class SetOfferStatusFromCustomerDto {
	@IsNumberString()
	@IsNotEmpty()
	@ApiProperty({
		description: 'Contest id status command',
		example: '1',
	})
	contestId: string;

	@IsNotEmpty()
	@IsEnum(OFFER_STATUS_COMMAND)
	@ApiProperty({
		description: 'Offer status command',
		enum: OFFER_STATUS_COMMAND,
		example: OFFER_STATUS_COMMAND.reject,
	})
	command: OFFER_STATUS_COMMAND;

	@IsNumberString()
	@IsNotEmpty()
	@ApiProperty({
		description: 'Offer id',
		example: '1',
	})
	offerId: string;

	@IsNumberString()
	@IsNotEmpty()
	@ApiProperty({
		description: 'Creator id',
		example: '3',
	})
	creatorId: string;

	@IsNotEmpty()
	@IsUUID()
	@ApiProperty({
		description: 'Contest order id',
		example: '0099108a-080d-42e4-8c0a-a693d0c0e2c0',
	})
	orderId: string;

	@IsNumberString()
	@IsNotEmpty()
	@ApiProperty({
		description: 'Priority contest',
		example: '1',
	})
	priority: string;

	@IsNotEmpty()
	@IsEmail()
	@ApiProperty({
		description: 'Creator email address',
		example: 'witcher@gmail.com',
	})
	emailCreator: string;
}

export class SetOfferStatusFromModeratorDto extends PickType(
	SetOfferStatusFromCustomerDto,
	['command', 'offerId', 'emailCreator'],
) {
	@ApiProperty({
		description: 'Customer email address',
		example: 'ragnar@gmail.com',
	})
	@IsNotEmpty()
	@IsEmail()
	emailCustomer: string;
}

export class OfferUpdateDto extends PickType(OfferDataDto, [
	'id',
	'text',
	'originalFileName',
	'fileName',
	'status',
]) {}

export class OfferUpdateOneDto extends IntersectionType(
	PickType(OfferUpdateDto, [
		'id',
		'text',
		'originalFileName',
		'fileName',
		'status',
	]),
	PickType(OfferDataForMailDto, ['contest']),
) {}

export class OfferUpdateManyDto extends OfferUpdateDto {
	email: string;
	title: string;
	first_name: string;
	last_name: string;
}
