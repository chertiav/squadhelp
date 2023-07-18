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
	Version,
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
import { AppMessages } from '../../common/messages';
import { AuthConstants } from '../../common/constants';
import {
	BadRequestExceptionResDto,
	ForbiddenExceptionResDto,
	UnauthorizedExceptionResDto,
} from '../../common/dto/exception';
import {
	LoginAuthDto,
	LoginAuthResDto,
	LoginCheckAuthResDto,
	LogoutAuthResDto,
	RegisterAuthDto,
	RegisterAuthResDto,
} from '../../common/dto/auth';
import { IAuthUser, ILocalGuardRequest } from '../../common/interfaces/auth';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@ApiOperation({ description: 'User registration' })
	@ApiBody({
		description: 'User data',
		type: RegisterAuthDto,
	})
	@ApiCreatedResponse({
		description: 'Successfully created user data and  information message',
		type: RegisterAuthResDto,
	})
	@ApiBadRequestResponse({
		description: 'Bad request message',
		type: BadRequestExceptionResDto,
	})
	@HttpCode(HttpStatus.CREATED)
	@Version('1')
	@Post('register')
	async register(
		@Res({ passthrough: true }) res: Response,
		@Body() dto: RegisterAuthDto,
	): Promise<RegisterAuthResDto> {
		const { user, token }: IAuthUser = await this.authService.register(dto);
		res.cookie('token', token, {
			...AuthConstants.AUTH_COOKIES_OPTIONS,
		});
		return { user, message: AppMessages.MSG_REGISTER };
	}

	@ApiOperation({ description: 'User login in' })
	@ApiBody({
		description: 'User data for login in',
		type: LoginAuthDto,
	})
	@ApiForbiddenResponse({
		description: 'Forbidden exception message',
		type: ForbiddenExceptionResDto,
	})
	@ApiOkResponse({
		description: 'Successfully login in user data and information message',
		type: LoginAuthResDto,
	})
	@UseGuards(LocalAuthGuard)
	@HttpCode(HttpStatus.OK)
	@Version('1')
	@Post('login')
	async login(
		@Res({ passthrough: true }) res: Response,
		@Req() req: ILocalGuardRequest,
	): Promise<LoginAuthResDto> {
		const { user, token }: IAuthUser = await this.authService.login(req.user);
		res.cookie('token', token, {
			...AuthConstants.AUTH_COOKIES_OPTIONS,
		});
		return { user, message: AppMessages.MSG_LOGGED_IN };
	}

	@UseGuards(JWTAuthGuard)
	@ApiCookieAuth()
	@ApiUnauthorizedResponse({
		description: 'Unauthorized message',
		type: UnauthorizedExceptionResDto,
	})
	@ApiOkResponse({
		description: 'Successfully check token data and information message',
		type: LoginCheckAuthResDto,
	})
	@Version('1')
	@Get('/login-check')
	loginCheck(@Req() request): Promise<LoginCheckAuthResDto> {
		return request.user;
	}

	@ApiOkResponse({
		description: 'Logout message',
		type: LogoutAuthResDto,
	})
	@HttpCode(HttpStatus.OK)
	@Version('1')
	@Get('logout')
	async logout(
		@Res({ passthrough: true }) res: Response,
	): Promise<LogoutAuthResDto> {
		res.clearCookie('token');
		return { message: AppMessages.MSG_LOGGED_OUT };
	}
}
