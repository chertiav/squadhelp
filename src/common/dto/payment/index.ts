import {
	ApiProperty,
	getSchemaPath,
	IntersectionType,
	PickType,
} from '@nestjs/swagger';
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
import { AppMessages } from '../../messages';
import { BalanceUserDto } from '../user';

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
		example: PayConstants.CUSTOMER_CREDIT_CARD_NUMBER,
	})
	number: string;

	@IsNotEmpty()
	@Matches(/^(0[1-9]|1[0-2])\/?(([0-9]{4}|[0-9]{2})$)/, {
		message: 'date must be in mm/yy format',
	})
	@ApiProperty({
		description: 'Expiry credit card',
		example: PayConstants.CUSTOMER_CREDIT_CARD_EXPIRY,
	})
	expiry: string;

	@IsNotEmpty()
	@Matches(/^[0-9]{3}$/, {
		message: 'cvc must contain three numbers',
	})
	@ApiProperty({
		description: 'cvc credit card',
		example: PayConstants.CUSTOMER_CREDIT_CARD_CVC,
	})
	cvc: string;

	@IsNotEmpty()
	@ApiProperty({
		description: 'Total payable',
		example: 300,
	})
	sum: number;

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
	contests: (
		| NameCreateContestPayDto
		| LogoCreateContestPayDto
		| TaglineCreateContestPayDto
	)[];
}

export class PayResDto {
	@ApiProperty({
		description: 'Success message',
		example: `${AppMessages.MSG_OPENED_NEW_CONTESTS}: 3`,
	})
	message: string;
}

export class CashOutDto extends PickType(PayDto, [
	'number',
	'expiry',
	'cvc',
	'sum',
]) {}

export class CashOutResDto extends BalanceUserDto {
	@ApiProperty({
		description: 'Success message',
		example: AppMessages.MSG_MONEY_SEND_SUCCESSFULLY,
	})
	message: string;
}
