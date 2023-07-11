import { ApiProperty } from '@nestjs/swagger';
import { ContestCommonByIdResDto } from './contest-common-by-id.res.dto';

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
export class ContestCreatorByIdResDto extends ContestCommonByIdResDto {
	@ApiProperty({
		description: 'User data of the contest organizer',
	})
	user: User;
}
