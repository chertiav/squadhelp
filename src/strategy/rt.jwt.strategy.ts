import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IJwtPayload, IUserJwt } from '../common/interfaces/auth';

@Injectable()
export class JwtRtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
	refreshToken: any;
	constructor(private readonly configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([JwtRtStrategy.extractJWTRt]),
			secretOrKey: configService.get<string>('secretRt'),
			ignoreExpiration: false,
		});
	}

	private static extractJWTRt(req: Request): string | null {
		if (req.cookies && 'jwtRt' in req.cookies) {
			return req.cookies.jwtRt;
		} else {
			return null;
		}
	}

	async validate(payload: IJwtPayload): Promise<IUserJwt> {
		return { ...payload.user };
	}
}
