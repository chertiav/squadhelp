import { PublicUserDto } from '../../dto/user';
import { Request } from 'express';
import { User } from '@prisma/client';

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
