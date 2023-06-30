import { PublicUserDto } from './public-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';
import { User } from '@prisma/client';

export class InfoUserDto extends PublicUserDto {
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
		description: 'Avatar filename',
		example: 'anon.png',
	})
	@IsNotEmpty()
	avatar: string;

	constructor(model: User) {
		super(model);
		this.firstName = model.firstName;
		this.lastName = model.lastName;
		this.avatar = model.avatar;
	}
}
