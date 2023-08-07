import { Request } from 'express';
import { ExamplesObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import { Role, User } from '@prisma/client';
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

export interface IValueLogin {
	value: {
		email: string;
		password: string;
	};
}

export interface IApiBodyExamplesLogin extends ExamplesObject {
	moderator: IValueLogin;
	customer_1: IValueLogin;
	customer_2: IValueLogin;
	creator_1: IValueLogin;
	creator_2: IValueLogin;
}

export interface IValueRegister {
	value: {
		firstName: string;
		lastName: string;
		displayName: string;
		email: string;
		password: string;
		role: Role;
	};
}

export interface IApiBodyExamplesRegister extends ExamplesObject {
	customer_1: IValueRegister;
	customer_2: IValueRegister;
	creator_1: IValueRegister;
	creator_2: IValueRegister;
}
