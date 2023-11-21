import { ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { User } from '@prisma/client';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { AppErrors } from '../../common/errors';
import { LoginAuthDto } from '../../common/dto/auth';
import { IAuthUser } from '../../common/interfaces/auth';
import { CreateUserDto, PublicUserDto } from '../../common/dto/user';
import { Tokens } from 'src/common/interfaces/token';

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
		const tokens: Tokens = await this.tokenService.generateJwtToken({
			...publicUser,
		});
		await this.updateRtHash(publicUser.id, tokens.refreshToken);
		return { tokens };
	}

	public async login(dto: LoginAuthDto): Promise<IAuthUser> {
		const publicUser: PublicUserDto = await this.userService.getPublicUser(
			dto.email,
		);
		const tokens: Tokens = await this.tokenService.generateJwtToken({
			...publicUser,
		});
		await this.updateRtHash(publicUser.id, tokens.refreshToken);
		return { tokens };
	}

	public async logout(userId: number): Promise<boolean> {
		await this.userService.updateUser(userId, { refreshToken: '' }, null);
		return true;
	}

	async refreshTokens(userId: number, rt: string): Promise<IAuthUser> {
		const user: User = await this.userService.findOne({
			where: {
				id: userId,
			},
		});
		const publicUser: PublicUserDto = {
			displayName: user.displayName,
			role: user.role,
			id: user.id,
			avatar: user.avatar,
		};
		const rtMatches: boolean = await bcrypt.compare(rt, user.refreshToken);
		if (!user || !user.refreshToken || !rtMatches)
			throw new ForbiddenException(AppErrors.NOT_ENOUGH_RIGHTS);
		const tokens: Tokens = await this.tokenService.generateJwtToken({
			...publicUser,
		});
		await this.updateRtHash(user.id, tokens.refreshToken);
		return { tokens };
	}

	async updateRtHash(userId: number, rt: string): Promise<void> {
		const hashToken = await this.userService.getHashData(rt);
		await this.userService.updateUser(
			userId,
			{ refreshToken: hashToken },
			null,
		);
	}
}
