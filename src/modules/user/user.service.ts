import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaClient, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
	CreateUserDto,
	InfoUserDto,
	PublicUserDto,
	UpdateUserDto,
} from '../../common/dto/user';
import { AppErrors } from '../../common/errors';
import { IUserUpdate } from '../../common/interfaces/user';
import { SELECT_USER_FIELDS } from '../../common/constants';
import { FileService } from '../file/file.service';
import { ITXClientDenyList } from '@prisma/client/runtime';

@Injectable()
export class UserService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly fileService: FileService,
	) {}

	public async findOne(filter: {
		where: { id?: number; email?: string };
	}): Promise<User | null> {
		try {
			return this.prisma.user.findUnique({ ...filter });
		} catch (e) {
			throw new InternalServerErrorException(
				AppErrors.INTERNAL_SERVER_ERROR_TRY_AGAIN_LATER,
				{
					cause: e,
				},
			);
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
			throw new InternalServerErrorException(
				AppErrors.INTERNAL_SERVER_ERROR_TRY_AGAIN_LATER,
				{
					cause: e,
				},
			);
		}
	}

	public async getPublicUser(email: string): Promise<PublicUserDto> {
		try {
			const user: User = await this.findOne({
				where: { email },
			});
			return new PublicUserDto(user);
		} catch (e) {
			throw new InternalServerErrorException(
				AppErrors.INTERNAL_SERVER_ERROR_TRY_AGAIN_LATER,
				{
					cause: e,
				},
			);
		}
	}

	public async getInfoUser(id: number): Promise<InfoUserDto> {
		try {
			const user: User = await this.findOne({
				where: { id },
			});
			return new InfoUserDto(user);
		} catch (e) {
			throw new InternalServerErrorException(
				AppErrors.INTERNAL_SERVER_ERROR_TRY_AGAIN_LATER,
				{
					cause: e,
				},
			);
		}
	}

	public async updateUser(
		dto: UpdateUserDto,
		id: number,
	): Promise<InfoUserDto> {
		try {
			dto.deleteFileName && this.fileService.removeFile(dto.deleteFileName);
			const userUpdateData: IUserUpdate = {
				firstName: dto.firstName,
				lastName: dto.lastName,
				displayName: dto.displayName,
				avatar: dto.avatar,
			};
			const updateUser: InfoUserDto = await this.prisma.$transaction(
				async (
					prisma: Omit<PrismaClient, ITXClientDenyList>,
				): Promise<InfoUserDto> => {
					return prisma.user.update({
						where: { id },
						data: { ...userUpdateData },
						select: { ...SELECT_USER_FIELDS },
					});
				},
			);
			if (updateUser) return updateUser;
		} catch (e) {
			throw new InternalServerErrorException(
				AppErrors.INTERNAL_SERVER_ERROR_TRY_AGAIN_LATER,
				{
					cause: e,
				},
			);
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
