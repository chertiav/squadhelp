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
} from '@nestjs/swagger';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { JWTRtAuthGuard, LocalAuthGuard } from '../../guards';
import { AppMessages } from '../../common/messages';
import { AuthConstants } from '../../common/constants';
import {
	BadRequestExceptionResDto,
	ForbiddenExceptionResDto,
} from '../../common/dto/exception';
import {
	LoginAuthDto,
	LoginAuthResDto,
	LogoutAuthResDto,
	RegisterAuthDto,
	RegisterAuthResDto,
} from '../../common/dto/auth';
import { IAuthUser, ILocalGuardRequest } from '../../common/interfaces/auth';
import { UserId } from '../../decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@ApiOperation({ description: 'User registration' })
	@ApiBody({
		description: 'User data',
		type: RegisterAuthDto,
		examples: AuthConstants.API_BODY_EXAMPLES_REGISTER,
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
		const { tokens }: IAuthUser = await this.authService.register(dto);
		res.cookie('jwtRt', tokens.refreshToken, {
			...AuthConstants.AUTH_COOKIES_OPTIONS,
		});
		return {
			accessToken: tokens.accessToken,
			message: AppMessages.MSG_REGISTER,
		};
	}

	@ApiOperation({ description: 'User login in' })
	@ApiBody({
		description: 'User data for login in',
		type: LoginAuthDto,
		examples: AuthConstants.API_BODY_EXAMPLES_LOGIN,
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
		const { tokens }: IAuthUser = await this.authService.login(req.user);
		res.cookie('jwtRt', tokens.refreshToken, {
			...AuthConstants.AUTH_COOKIES_OPTIONS,
		});
		return {
			accessToken: tokens.accessToken,
			message: AppMessages.MSG_LOGGED_IN,
		};
	}

	@ApiOkResponse({
		description: 'Logout message',
		type: LogoutAuthResDto,
	})
	@UseGuards(JWTRtAuthGuard)
	@HttpCode(HttpStatus.OK)
	@Version('1')
	@Get('logout')
	async logout(
		@UserId() id: number,
		@Res({ passthrough: true }) res: Response,
	): Promise<LogoutAuthResDto> {
		await this.authService.logout(id);
		res.clearCookie('jwtRt', {
			httpOnly: true,
			sameSite: 'none',
			secure: true,
		});
		return { message: AppMessages.MSG_LOGGED_OUT };
	}

	@UseGuards(JWTRtAuthGuard)
	@ApiCookieAuth()
	@ApiForbiddenResponse({
		description: 'Forbidden exception message',
		type: ForbiddenExceptionResDto,
	})
	@ApiOkResponse()
	@Version('1')
	@Get('refresh')
	@HttpCode(HttpStatus.OK)
	async refreshTokens(
		@Req() request: any,
		@Res({ passthrough: true }) res: Response,
		@UserId() userId: number,
	): Promise<{ accessToken: string }> {
		const refreshToken = request?.cookies?.jwtRt || null;
		const { tokens }: IAuthUser = await this.authService.refreshTokens(
			userId,
			refreshToken,
		);
		res.cookie('jwtRt', tokens.refreshToken, {
			...AuthConstants.AUTH_COOKIES_OPTIONS,
		});
		return {
			accessToken: tokens.accessToken,
		};
	}
}
