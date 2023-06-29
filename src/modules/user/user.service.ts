import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
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
		try {
			return this.prisma.user.findUnique({ ...filter });
		} catch (e) {
			throw new InternalServerErrorException((e as Error).message);
		}
	}

	public async createUser(dto: CreateUserDto): Promise<User> {
		try {
			return this.prisma.$transaction(async () => {
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
			});
		} catch (e) {
			throw new InternalServerErrorException((e as Error).message);
		}
	}

	public async getPublicUser(email: string): Promise<PublicUserDto> {
		try {
			const user: User = await this.findOne({
				where: { email },
			});
			return new PublicUserDto(user);
		} catch (e) {
			throw new InternalServerErrorException((e as Error).message);
		}
	}

	private async getHashPassword(
		password: string,
		salt?: string | number,
	): Promise<string> {
		try {
			const saltOrRounds: string | number = salt
				? salt
				: await bcrypt.genSalt();
			return bcrypt.hash(password, saltOrRounds);
		} catch (e) {
			throw new InternalServerErrorException(AppErrors.ISSUE_IN_THE_HASH);
		}
	}
}
