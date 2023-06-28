import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, PublicUserDto } from '../../common/dto/user';
import { AppErrors } from '../../common/errors';

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	public async findOne(filter: {
		where: { id?: number; email?: string };
	}): Promise<User | null> {
		return this.prisma.user.findUnique({ ...filter });
	}

	public async createUser(dto: CreateUserDto): Promise<User> {
		const existsUser: User | null = await this.findOne({
			where: { email: dto.email },
		});
		if (existsUser) throw new BadRequestException(AppErrors.USER_EXISTS);
		const hashPassword: string = await this.getHashPassword(dto.password);
		return this.prisma.user.create({
			data: {
				...dto,
				password: hashPassword,
			},
		});
	}

	public async getPublicUser(email: string): Promise<PublicUserDto> {
		const user: User = await this.findOne({
			where: { email },
		});
		return new PublicUserDto(user);
	}

	private async getHashPassword(
		password: string,
		salt?: string | number,
	): Promise<string> {
		const saltOrRounds: string | number = salt ? salt : await bcrypt.genSalt();
		return bcrypt.hash(password, saltOrRounds);
	}
}
