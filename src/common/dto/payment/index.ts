import { ApiProperty, getSchemaPath, IntersectionType } from '@nestjs/swagger';
import { FilesDto } from '../file';
import {
	ArrayMaxSize,
	ArrayMinSize,
	IsArray,
	IsBoolean,
	IsCreditCard,
	IsNotEmpty,
	Matches,
} from 'class-validator';

import { PayConstants } from '../../constants';
import {
	LogoCreateContestDto,
	NameCreateContestDto,
	TaglineCreateContestDto,
} from '../contest';
import { Decimal } from '@prisma/client/runtime/library';
import { AppMessages } from '../../messages';

class HaveFileCreateContestDto {
	@IsNotEmpty()
	@IsBoolean()
	@ApiProperty({
		description: 'File presence flag',
		enum: [true, false],
		example: false,
	})
	haveFile: boolean;
}

export class NameCreateContestPayDto extends IntersectionType(
	NameCreateContestDto,
	HaveFileCreateContestDto,
) {}

export class LogoCreateContestPayDto extends IntersectionType(
	LogoCreateContestDto,
	HaveFileCreateContestDto,
) {}

export class TaglineCreateContestPayDto extends IntersectionType(
	TaglineCreateContestDto,
	HaveFileCreateContestDto,
) {}

export class PayDto extends IntersectionType(FilesDto) {
	@IsNotEmpty()
	@IsCreditCard({ context: '' })
	@ApiProperty({
		description: 'Number credit card',
		example: '4111 1111 1111 1111',
	})
	number: string;

	@IsNotEmpty()
	@Matches(/^(0[1-9]|1[0-2])\/?(([0-9]{4}|[0-9]{2})$)/, {
		message: 'date must be in mm/yy format',
	})
	@ApiProperty({
		description: 'Expiry credit card',
		example: '09/23',
	})
	expiry: string;

	@IsNotEmpty()
	@Matches(/^[0-9]{3}$/, {
		message: 'cvc must contain three numbers',
	})
	@ApiProperty({
		description: 'cvc credit card',
		example: '505',
	})
	cvc: string;

	@ApiProperty({
		description: 'Total payable',
		example: '300',
		type: 'number',
	})
	totalPrice: Decimal;

	@IsArray()
	@ArrayMinSize(1)
	@ArrayMaxSize(3)
	@ApiProperty({
		type: 'array',
		description:
			'When adding a file, in the desired contest, you need to change the haveFile field to true',
		items: {
			type: 'object',
			anyOf: [
				{ $ref: getSchemaPath(NameCreateContestPayDto) },
				{ $ref: getSchemaPath(LogoCreateContestPayDto) },
				{ $ref: getSchemaPath(TaglineCreateContestPayDto) },
			],
		},
		example: [
			PayConstants.API_PROPERTY_PAY_EXAMPLE_NAME,
			PayConstants.API_PROPERTY_PAY_EXAMPLE_TAGLINE,
			PayConstants.API_PROPERTY_PAY_EXAMPLE_LOGO,
		],
	})
	contests: [
		NameCreateContestPayDto,
		TaglineCreateContestPayDto,
		LogoCreateContestPayDto,
	];
}

export class PayResDto {
	@ApiProperty({
		description: 'Success message',
		example: `${AppMessages.MSG_OPENED_NEW_CONTESTS}: 3`,
	})
	message: string;
}
