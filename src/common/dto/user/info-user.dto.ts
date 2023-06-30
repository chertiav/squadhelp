import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { User } from '@prisma/client';
import { PublicUserDto } from './public-user.dto';

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

	constructor(model: User) {
		super(model);
		this.firstName = model.firstName;
		this.lastName = model.lastName;
	}
}
