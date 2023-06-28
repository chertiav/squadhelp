import { IUserJwt } from './i-user-jwt';

export interface IJwtPayload {
	user: IUserJwt;
	iat: number;
	exp: number;
}
