import { ContestCommonDto } from './contest.common.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ContestCustomerByIdResDto extends ContestCommonDto {
	@ApiProperty({
		description: 'The name of the file',
		example: 'anon.png',
	})
	fileName: string;

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