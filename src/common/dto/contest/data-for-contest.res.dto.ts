import { ApiProperty } from '@nestjs/swagger';
import { OPTIONS_FOR_API_PROPERTY } from '../../constants';

export class DataForContestResDto {
	@ApiProperty({
		...OPTIONS_FOR_API_PROPERTY.DATA_FOR_CONTEST.COMMON_PROPERTY,
		required: false,
		example: OPTIONS_FOR_API_PROPERTY.DATA_FOR_CONTEST.EXAMPLE_TYPE_OF_NAME,
	})
	typeOfName?: string[];

	@ApiProperty({
		...OPTIONS_FOR_API_PROPERTY.DATA_FOR_CONTEST.COMMON_PROPERTY,
		required: false,
		example: OPTIONS_FOR_API_PROPERTY.DATA_FOR_CONTEST.EXAMPLE_TYPE_OF_NAME,
	})
	nameStyle?: string[];

	@ApiProperty({
		...OPTIONS_FOR_API_PROPERTY.DATA_FOR_CONTEST.COMMON_PROPERTY,
		required: false,
		example: OPTIONS_FOR_API_PROPERTY.DATA_FOR_CONTEST.EXAMPLE_BRAND_STYLE,
	})
	brandStyle?: string[];

	@ApiProperty({
		...OPTIONS_FOR_API_PROPERTY.DATA_FOR_CONTEST.COMMON_PROPERTY,
		required: false,
		example: OPTIONS_FOR_API_PROPERTY.DATA_FOR_CONTEST.EXAMPLE_TYPE_OF_TAGLINE,
	})
	typeOfTagline?: string[];

	@ApiProperty({
		...OPTIONS_FOR_API_PROPERTY.DATA_FOR_CONTEST.COMMON_PROPERTY,
		required: true,
		example: OPTIONS_FOR_API_PROPERTY.DATA_FOR_CONTEST.EXAMPLE_INDUSTRY,
	})
	industry: string[];
}
