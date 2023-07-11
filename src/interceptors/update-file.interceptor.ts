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
export class UpdateFileInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const ctx: HttpArgumentsHost = context.switchToHttp();
		const req = ctx.getRequest();
		if (req.body && req.file) {
			if (!req.body?.contestId) {
				req.body.avatar = req.file.filename;
			}
			if (req.body?.contestId) {
				const fileNameEncode: string = Buffer.from(
					req.file.originalname,
					'latin1',
				).toString('utf8');
				req.body.fileName = req.file.filename;
				req.body.originalFileName = fileNameEncode;
			}
		}
		if (req.body.deleteFileName && !req.file) {
			if (!req.body?.contestId) {
				req.body.avatar = DEFAULT_AVATAR_NAME;
			}
			if (req.body?.contestId) {
				req.body.originalFileName = '';
				req.body.fileName = '';
			}
		}
		return next.handle();
	}
}
