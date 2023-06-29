import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { JWTAuthGuard, LocalAuthGuard } from '../../guards';
import { CreateUserDto, PublicUserDto } from '../../common/dto/user';
import { AppMessages } from '../../common/messages';
import { AUTH_COOKIES_OPTIONS } from '../../common/constants';
import { ILocalGuardRequest } from '../../common/interfaces/auth/i-local-guard-request';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	@HttpCode(HttpStatus.CREATED)
	async register(
		@Res({ passthrough: true }) res: Response,
		@Body() dto: CreateUserDto,
	): Promise<{ user: PublicUserDto; message: string }> {
		const { user, token } = await this.authService.register(dto);
		res.cookie('token', token, { ...AUTH_COOKIES_OPTIONS });
		return { user, message: AppMessages.MSG_REGISTER };
	}

	@Post('login')
	@UseGuards(LocalAuthGuard)
	@HttpCode(HttpStatus.OK)
	async login(
		@Res({ passthrough: true }) res: Response,
		@Req() req: ILocalGuardRequest,
	): Promise<{ user: PublicUserDto; message: string }> {
		const { user, token } = await this.authService.login(req.user);
		res.cookie('token', token, { ...AUTH_COOKIES_OPTIONS });
		return { user, message: AppMessages.MSG_LOGGED_IN };
	}

	@Get('/login-check')
	@UseGuards(JWTAuthGuard)
	loginCheck(@Req() request) {
		return request.user;
	}

	@Get('logout')
	@UseGuards(JWTAuthGuard)
	@HttpCode(HttpStatus.OK)
	async logout(
		@Res({ passthrough: true }) res: Response,
	): Promise<{ message: string }> {
		res.clearCookie('token');
		return { message: AppMessages.MSG_LOGGED_OUT };
	}
}
