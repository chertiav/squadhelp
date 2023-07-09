import { ContestCommonDto } from './contest.common.dto';
import { ApiProperty } from '@nestjs/swagger';

class User {
	@ApiProperty({
		description: 'Name of the contest organizer',
		example: 'Ragnar',
	})
	firstName: string;
	@ApiProperty({
		description: 'Last name of the contest organizer',
		example: 'Lodbrok',
	})
	lastName: string;
	@ApiProperty({
		description: 'Display name of the contest organizer',
		example: 'ragnarek',
	})
	displayName: string;
	@ApiProperty({
		description: "The name of the file with the contest organizer's avatar",
		example: 'anon.png',
	})
	avatar: string;
}
export class ContestCreatorByIdResDto extends ContestCommonDto {
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

	@ApiProperty({
		description: 'User data of the contest organizer',
	})
	user: User;
}
