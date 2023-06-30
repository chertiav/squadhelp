import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class UpdateUserDto {
	@ApiProperty({
		description: 'The name of the User',
		example: 'Ragnar',
	})
	@IsNotEmpty()
	firstName: string;

	@ApiProperty({
		description: 'The surname of the User',
		example: 'Lodbrok',
	})
	@IsNotEmpty()
	lastName: string;

	@ApiProperty({
		description: 'The display name of the User',
		example: 'ragnarek',
	})
	@IsNotEmpty()
	@Length(4, 10)
	displayName: string;

	@ApiProperty({
		description: 'Avatar filename',
		example: 'anon.png',
	})
	@IsNotEmpty()
	avatar: string;
}
