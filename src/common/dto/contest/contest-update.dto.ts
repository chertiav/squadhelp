import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

import { ApiFile } from '../../../decorators';
import { ContestType } from '@prisma/client';

export class ContestUpdateDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		description: 'Contest id',
		example: 1,
	})
	contestId: string;

	@IsString()
	@Length(3)
	@ApiProperty({
		description: 'Name venture',
		example: null,
		required: false,
	})
	nameVenture: string;

	@IsNotEmpty()
	@IsString()
	@IsEnum(ContestType)
	@ApiProperty({
		description: 'Type of an active customer contest',
		enum: Object.values(ContestType),
		example: ContestType.name,
	})
	contestType: ContestType;

	@IsNotEmpty()
	@IsString()
	@Length(3)
	@ApiProperty({
		description: 'Name of an active customer contest',
		example: 'Name of contest',
	})
	title: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty({
		description: 'Prize money of the competition',
		example: 'Creative Agency',
	})
	industry: string;

	@IsNotEmpty()
	@IsString()
	@Length(3)
	@ApiProperty({
		description: 'Description of the direction of work',
		example: 'What does your company',
	})
	focusOfWork: string;

	@IsNotEmpty()
	@IsString()
	@Length(3)
	@ApiProperty({
		description: 'Target customer description',
		example: 'Tell us about your customers',
	})
	targetCustomer: string;

	@IsString()
	@Length(3)
	@ApiProperty({
		description: 'Style name',
		example: 'Classic',
		required: false,
	})
	styleName: string;

	@IsString()
	@Length(3)
	@ApiProperty({
		description: 'Type of name an active customer contest',
		example: 'Company',
		required: false,
	})
	typeOfName: string;

	@IsString()
	@Length(3)
	@ApiProperty({
		description: 'Type of typeOfTagline an active customer contest',
		example: null,
		required: false,
	})
	typeOfTagline: string;

	@IsString()
	@Length(3)
	@ApiProperty({
		description: "Corporate identity type of the client's active competition",
		example: null,
		required: false,
	})
	brandStyle: string;

	@ApiProperty({
		description: 'The name of the file to be deleted',
		example: '',
		required: false,
	})
	@IsString()
	deleteFileName?: string;

	@ApiFile()
	file?: Express.Multer.File;
}
