import { ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { User } from '@prisma/client';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { AppErrors } from '../../common/errors';
import { LoginAuthDto } from '../../common/dto/auth';
import { IAuthUser } from '../../common/interfaces/auth';
import { CreateUserDto, PublicUserDto } from '../../common/dto/user';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
	) {}

	public async validateUser(email: string, password: string): Promise<User> {
		const user: User = await this.userService.findOne({ where: { email } });
		if (!user) {
			throw new ForbiddenException(AppErrors.USER_WRONG_LOGIN_OR_PASSWORD);
		}
		const passwordValid: boolean = await bcrypt.compare(
			password,
			user.password,
		);
		if (!passwordValid) {
			throw new ForbiddenException(AppErrors.USER_WRONG_LOGIN_OR_PASSWORD);
		}
		return user;
	}

	public async register(dto: CreateUserDto): Promise<IAuthUser> {
		const publicUser: PublicUserDto = await this.userService.createUser(dto);
		const token: string = await this.tokenService.generateJwtToken({
			...publicUser,
		});
		return { user: publicUser, token };
	}

	public async login(dto: LoginAuthDto): Promise<IAuthUser> {
		const publicUser: PublicUserDto = await this.userService.getPublicUser(
			dto.email,
		);
		const token: string = await this.tokenService.generateJwtToken({
			...publicUser,
		});
		return { user: publicUser, token };
	}
}
