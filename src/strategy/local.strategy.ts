import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';

import { User } from '@prisma/client';
import { AuthService } from '../modules/auth/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
	constructor(private readonly authService: AuthService) {
		super({
			usernameField: 'email',
		});
	}

	async validate(email: string, password: string): Promise<User> {
		return this.authService.validateUser(email, password);
	}
}
