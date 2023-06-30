import { ApiProperty } from '@nestjs/swagger';

import { User } from '@prisma/client';
import { UserRolesEnum } from '../../enum/user';
import { IsNotEmpty } from 'class-validator';

export class PublicUserDto {
	@ApiProperty({
		description: 'The id of the User',
		example: 2,
	})
	id: number;

	@ApiProperty({
		description: 'The display name of the User',
		example: 'ragnarek',
	})
	displayName: string;

	@ApiProperty({
		description: `User's roles`,
		enum: Object.values(UserRolesEnum),
		example: Object.values(UserRolesEnum)[1],
		isArray: false,
	})
	role: string;

	@ApiProperty({
		description: 'Avatar filename',
		example: 'anon.png',
	})
	@IsNotEmpty()
	avatar: string;

	constructor(model: User) {
		this.id = model.id;
		this.displayName = model.displayName;
		this.role = model.role;
		this.avatar = model.avatar;
	}
}
