import { Request } from 'express';
import { User } from '@prisma/client';

export interface ILocalGuardRequest extends Request {
	user: User;
}
