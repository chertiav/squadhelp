import { User } from '@prisma/client';

export class PublicUserDto {
	id: number;
	displayName: string;
	role: string;

	constructor(model: User) {
		this.id = model.id;
		this.displayName = model.displayName;
		this.role = model.role;
	}
}
