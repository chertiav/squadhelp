import { Request } from 'express';
import { ExamplesObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import { User } from '@prisma/client';
import { PublicUserDto } from '../../dto/user';

export interface IAuthUser {
	user: PublicUserDto;
	token: string;
}

export interface ILocalGuardRequest extends Request {
	user: User;
}

export interface IUserJwt {
	id: number;
	role: string;
	displayName: string;
	avatar: string;
}

export interface IJwtPayload {
	user: IUserJwt;
	iat: number;
	exp: number;
}

export interface IValueExamplesLogin {
	value: {
		email: string;
		password: string;
	};
}

export interface IApiBodyExamplesLogin extends ExamplesObject {
	moderator: IValueExamplesLogin;
	customer_1: IValueExamplesLogin;
	customer_2: IValueExamplesLogin;
	creator_1: IValueExamplesLogin;
	creator_2: IValueExamplesLogin;
}
