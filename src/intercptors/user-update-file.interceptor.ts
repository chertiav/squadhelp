import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

import { DEFAULT_AVATAR_NAME } from '../common/constants';

@Injectable()
export class UserUpdateFileInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const ctx: HttpArgumentsHost = context.switchToHttp();
		const req = ctx.getRequest();
		if (req.body && req.file) {
			req.body.avatar = req.file.filename;
		}
		if (req.body.deleteAvatar && !req.file) {
			req.body.avatar = DEFAULT_AVATAR_NAME;
		}
		return next.handle();
	}
}
