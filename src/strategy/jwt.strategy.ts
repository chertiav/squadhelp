import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IUserJwt, IJwtPayload } from '../common/interfaces/auth';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJWT]),
			secretOrKey: configService.get<string>('secret'),
			ignoreExpiration: false,
		});
	}

	private static extractJWT(req: Request): string | null {
		if (req.cookies && 'token' in req.cookies) {
			return req.cookies.token;
		} else {
			return null;
		}
	}

	async validate(payload: IJwtPayload): Promise<IUserJwt> {
		return { ...payload.user };
	}
}
