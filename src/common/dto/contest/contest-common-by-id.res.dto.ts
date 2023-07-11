import { ApiProperty } from '@nestjs/swagger';
import { ContestCommonDto } from './contest.common.dto';

export class ContestCommonByIdResDto extends ContestCommonDto {
	@ApiProperty({
		description: 'Unique filename in the database',
		example: 'anon.png',
	})
	fileName: string;

	@ApiProperty({
		description: 'Original file name',
		example: 'anon.png',
	})
	originalFileName: string;

	@ApiProperty({
		description: 'Description of the direction of work',
		example: 'What does your company',
	})
	focusOfWork: string;

	@ApiProperty({
		description: 'Prize money of the competition',
		example: 'Creative Agency',
	})
	industry: string;

	@ApiProperty({
		description: 'Name venture',
		example: 'name venture',
	})
	nameVenture: string | null;

	@ApiProperty({
		description: 'Style name',
		example: 'Classic',
	})
	styleName: string;

	@ApiProperty({
		description: 'Target customer description',
		example: 'Tell us about your customers',
	})
	targetCustomer: string | null;
}
