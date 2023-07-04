import { ApiProperty } from '@nestjs/swagger';

import { User } from '@prisma/client';
import { PublicUserDto } from './public-user.dto';

export class InfoUserDto extends PublicUserDto {
	@ApiProperty({
		description: 'The name of the User',
		example: 'Ragnar',
	})
	firstName: string;

	@ApiProperty({
		description: 'The surname of the User',
		example: 'Lodbrok',
	})
	lastName: string;

	@ApiProperty({
		description: 'The email address of the User',
		example: 'ragnar@gmail.com',
	})
	email: string;

	constructor(model: User) {
		super(model);
		this.firstName = model.firstName;
		this.lastName = model.lastName;
		this.email = model.email;
	}
}
