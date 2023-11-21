import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { IUserJwt } from '../../common/interfaces/auth';
import { Tokens } from '../../common/interfaces/token';

@Injectable()
export class TokenService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
	) {}

	public async generateJwtToken(payload: IUserJwt): Promise<Tokens> {
		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(
				{ user: payload },
				{
					secret: this.configService.get<string>('secret'),
					expiresIn: this.configService.get<string>('expireJwt'),
				},
			),
			this.jwtService.signAsync(
				{ user: payload },
				{
					secret: this.configService.get<string>('secretRt'),
					expiresIn: this.configService.get<string>('expireRtJwt'),
				},
			),
		]);
		return {
			accessToken,
			refreshToken,
		};
	}
}
