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
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiCookieAuth,
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { JWTAuthGuard, LocalAuthGuard } from '../../guards';
import {
	CreateUserDto,
	LoginUserDto,
	PublicUserDto,
} from '../../common/dto/user';
import { AppMessages } from '../../common/messages';
import { AUTH_COOKIES_OPTIONS } from '../../common/constants';
import { ILocalGuardRequest } from '../../common/interfaces/auth/i-local-guard-request';
import {
	LoginAuthRes,
	LogoutAuthRes,
	RegisterAuthRes,
} from '../../common/types/response/auth';
import {
	BadRequestExceptionRes,
	ForbiddenExceptionRes,
	UnauthorizedExceptionRes,
} from '../../common/types/response/exception';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@ApiOperation({ description: 'User registration' })
	@ApiBody({
		description: 'User data',
		type: CreateUserDto,
	})
	@ApiCreatedResponse({
		description: 'Successfully created user data and  information message',
		type: RegisterAuthRes,
	})
	@ApiBadRequestResponse({
		description: 'Bad request message',
		type: BadRequestExceptionRes,
	})
	@HttpCode(HttpStatus.CREATED)
	@Post('register')
	async register(
		@Res({ passthrough: true }) res: Response,
		@Body() dto: CreateUserDto,
	): Promise<RegisterAuthRes> {
		const { user, token }: { user: PublicUserDto; token: string } =
			await this.authService.register(dto);
		res.cookie('token', token, { ...AUTH_COOKIES_OPTIONS });
		return { user, message: AppMessages.MSG_REGISTER };
	}

	@ApiOperation({ description: 'User login in' })
	@ApiBody({
		description: 'User data for login in',
		type: LoginUserDto,
	})
	@ApiForbiddenResponse({
		description: 'Forbidden exception message',
		type: ForbiddenExceptionRes,
	})
	@ApiOkResponse({
		description: 'Successfully login in user data and information message',
		type: LoginAuthRes,
	})
	@UseGuards(LocalAuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post('login')
	async login(
		@Res({ passthrough: true }) res: Response,
		@Req() req: ILocalGuardRequest,
	): Promise<{ user: PublicUserDto; message: string }> {
		const { user, token }: { user: PublicUserDto; token: string } =
			await this.authService.login(req.user);
		res.cookie('token', token, { ...AUTH_COOKIES_OPTIONS });
		return { user, message: AppMessages.MSG_LOGGED_IN };
	}

	@UseGuards(JWTAuthGuard)
	@ApiCookieAuth()
	@ApiUnauthorizedResponse({
		description: 'Unauthorized message',
		type: UnauthorizedExceptionRes,
	})
	@ApiOkResponse({
		description: 'Successfully check token data and information message',
		type: PublicUserDto,
	})
	@Get('/login-check')
	loginCheck(@Req() request) {
		return request.user;
	}

	@ApiOkResponse({
		description: 'Logout message',
		type: LogoutAuthRes,
	})
	@HttpCode(HttpStatus.OK)
	@Get('logout')
	async logout(
		@Res({ passthrough: true }) res: Response,
	): Promise<{ message: string }> {
		res.clearCookie('token');
		return { message: AppMessages.MSG_LOGGED_OUT };
	}
}
