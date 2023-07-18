import {
	ApiProperty,
	IntersectionType,
	OmitType,
	PartialType,
	PickType,
} from '@nestjs/swagger';
import {
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsString,
	Length,
} from 'class-validator';

import {
	BrandStyle,
	ContestStatus,
	ContestType,
	Industry,
	StyleName,
	TypeOfName,
	TypeOfTagline,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { ContestConstants } from '../../../common/constants';
import { QueryPaginationDto } from '../pagination';
import { InfoUserDto } from '../user';
import { FileDto } from '../file';
import { AppMessages } from '../../messages';

// data for contest
export class DataContestDto {
	@ApiProperty({
		...ContestConstants.OPTIONS_API_PROPERTY_DATA_CONTEST,
		example: ContestConstants.INDUSTRY_API_PROPERTY_DATA_CONTEST,
	})
	industry: Industry[];
	@ApiProperty({
		...ContestConstants.OPTIONS_API_PROPERTY_DATA_CONTEST,
		example: Object.keys(TypeOfName),
	})
	typeOfName?: TypeOfName[];

	@ApiProperty({
		...ContestConstants.OPTIONS_API_PROPERTY_DATA_CONTEST,
		example: Object.keys(StyleName),
	})
	nameStyle?: StyleName[];
	@ApiProperty({
		...ContestConstants.OPTIONS_API_PROPERTY_DATA_CONTEST,
		example: ContestConstants.BRAND_STYLE_API_PROPERTY_DATA_CONTEST,
	})
	brandStyle?: BrandStyle[];
	@ApiProperty({
		...ContestConstants.OPTIONS_API_PROPERTY_DATA_CONTEST,
		example: Object.keys(TypeOfTagline),
	})
	typeOfTagline?: TypeOfTagline[];
}

export class NameDataContestResDto extends PickType(DataContestDto, [
	'industry',
	'typeOfName',
	'nameStyle',
]) {}

export class LogoDataContestResDto extends PickType(DataContestDto, [
	'industry',
	'brandStyle',
]) {}
export class TaglineDataContestResDto extends PickType(DataContestDto, [
	'industry',
	'typeOfTagline',
]) {}

// get all contests
class ContestStatusDto extends QueryPaginationDto {
	@ApiProperty({
		description: 'Contest status',
		enum: ContestConstants.CONTEST_STATUS,
		example: ContestConstants.CONTEST_STATUS[0],
	})
	@IsString()
	@IsNotEmpty()
	status: ContestStatus;
}

class countOffers {
	@ApiProperty({ description: 'Number of active offers', example: 1 })
	offers: number;
}

export class ContestDto {
	@IsNotEmpty()
	@ApiProperty({ description: "Client's active competition ID", example: 1 })
	id: number;

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
	@IsEnum(ContestType)
	@ApiProperty({
		description: 'Type of an active customer contest',
		enum: Object.values(ContestType),
		example: ContestType.name,
	})
	contestType: ContestType;

	@IsEnum(TypeOfName)
	@IsString()
	@ApiProperty({
		description: 'Type of name an active customer contest',
		enum: Object.values(TypeOfName),
		example: TypeOfName.Company,
	})
	typeOfName: TypeOfName;

	@IsString()
	@ApiProperty({
		description: "Corporate identity type of the client's active competition",
		enum: Object.values(BrandStyle),
		example: BrandStyle.Fun,
	})
	brandStyle: BrandStyle;

	@IsString()
	@ApiProperty({
		description: 'Type of typeOfTagline an active customer contest',
		enum: Object.values(TypeOfTagline),
		example: TypeOfTagline.Classic,
	})
	typeOfTagline: TypeOfTagline;

	@ApiProperty({
		description: 'Date of start contest',
		example: '2023-07-05T18:39:42.143Z',
	})
	createdAt: Date;

	@ApiProperty({
		description: 'Prize money of the competition',
		example: '100',
		type: 'number',
	})
	price: Decimal;

	@ApiProperty()
	_count?: countOffers;
}
export class ModeratorContestDto extends PickType(ContestDto, [
	'id',
	'title',
	'contestType',
	'typeOfName',
	'typeOfTagline',
	'brandStyle',
	'_count',
]) {}
export class QueryCustomerContestDto extends ContestStatusDto {}
export class QueryCreatorContestDto extends ContestStatusDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		description: 'Filter by industry',
		enum: ContestConstants.CREATOR_QUERY_CONTEST_INDUSTRY,
		example: ContestConstants.CREATOR_QUERY_CONTEST_INDUSTRY[0],
	})
	industry: Industry;

	@IsNotEmpty()
	@IsString()
	@ApiProperty({
		description: 'Filter by type',
		enum: ContestConstants.CONTEST_TYPE,
		example: ContestConstants.CONTEST_TYPE[0],
	})
	typeIndex: string;

	@IsNumber()
	@ApiProperty({
		description: 'Filter by contest id',
		required: false,
		example: '',
	})
	contestId: number;

	@IsNotEmpty()
	@IsString()
	@ApiProperty({
		description: 'Sorting order',
		enum: ['asc', 'desc'],
		example: 'asc',
	})
	awardSort: string;

	@IsNotEmpty()
	@IsBoolean()
	@ApiProperty({
		description: 'Contests with own entries',
		enum: ['true', 'false'],
		example: 'false',
	})
	ownEntries: string;
}
export class QueryModeratorContestDto extends IntersectionType(
	ContestStatusDto,
	PickType(QueryCreatorContestDto, ['typeIndex', 'contestId', 'industry']),
) {}

export class ContestsResDto {
	@ApiProperty({
		description: 'List of contests',
		isArray: true,
		type: ContestDto,
	})
	contests: ContestDto[];

	@ApiProperty({ description: 'Number of active contests', example: 1 })
	totalCount: number;
}

export class CustomerContestsResDto extends ContestsResDto {}
export class CreatorContestsResDto extends ContestsResDto {}

export class ModeratorContestResDto extends PickType(ContestsResDto, [
	'totalCount',
]) {
	@ApiProperty({
		description: 'List of contests',
		isArray: true,
		type: ModeratorContestDto,
	})
	contests: ModeratorContestDto[];
}

//get contest by id

export class CustomerContestByIdResDto extends ContestDto {
	@ApiProperty({
		description: 'Unique filename in the database',
		example: '',
	})
	fileName: string;

	@ApiProperty({
		description: 'Original file name',
		example: '',
	})
	originalFileName: string;

	@IsNotEmpty()
	@IsString()
	@Length(3)
	@ApiProperty({
		description: 'Description of the direction of work',
		example: 'What does your company',
	})
	focusOfWork: string;

	@IsNotEmpty()
	@IsEnum(Industry)
	@IsString()
	@ApiProperty({
		description: 'Filter by industry',
		enum: Object.values(Industry),
		example: Industry.CreativeAgency,
	})
	industry: Industry;

	@IsString()
	@ApiProperty({
		description: 'Name venture',
		example: 'Name venture',
	})
	nameVenture: string;

	@IsString()
	@IsEnum(StyleName)
	@ApiProperty({
		description: 'Style name',
		enum: Object.values(StyleName),
		example: StyleName.Classic,
	})
	styleName: StyleName;

	@IsNotEmpty()
	@IsString()
	@Length(3)
	@ApiProperty({
		description: 'Target customer description',
		example: 'Tell us about your customers',
	})
	targetCustomer: string;
}

class InfoUserContest extends PickType(InfoUserDto, [
	'firstName',
	'lastName',
	'displayName',
	'avatar',
] as const) {}

export class CreatorContestByIdResDto extends CustomerContestByIdResDto {
	@ApiProperty({
		description: 'User data of the contest organizer',
	})
	user?: InfoUserContest;
}

export class ModeratorContestByIdResDto extends PartialType(
	OmitType(CustomerContestByIdResDto, ['price'] as const),
) {}

// update contest
export class NameContestUpdateData extends IntersectionType(
	PickType(ContestDto, ['title']),
	PickType(CustomerContestByIdResDto, [
		'industry',
		'focusOfWork',
		'targetCustomer',
		'typeOfName',
		'styleName',
	]),
	FileDto,
) {}

export class TagLineContestUpdateDto extends IntersectionType(
	OmitType(NameContestUpdateData, ['styleName', 'typeOfName'] as const),
	PickType(CustomerContestByIdResDto, ['nameVenture', 'typeOfTagline']),
) {}

export class LogoContestUpdateDto extends IntersectionType(
	OmitType(TagLineContestUpdateDto, ['typeOfTagline'] as const),
	PickType(CustomerContestByIdResDto, ['brandStyle']),
) {}

export class CustomerUpdateContestResDto {
	@ApiProperty()
	contest: CustomerContestByIdResDto;

	@ApiProperty({
		description: 'Success message',
		example: AppMessages.MSG_CONTEST_INFORMATION_UPDATED,
	})
	message: string;
}
