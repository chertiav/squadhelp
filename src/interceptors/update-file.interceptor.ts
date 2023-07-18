import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

import { CommonConstants } from '../common/constants';

@Injectable()
export class UpdateFileInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const ctx: HttpArgumentsHost = context.switchToHttp();
		const req = ctx.getRequest();
		if (req.body && req.file) {
			if (!req.body?.industry) {
				req.body.avatar = req.file.filename;
			}
			if (req.body?.industry) {
				const fileNameEncode: string = Buffer.from(
					req.file.originalname,
					'latin1',
				).toString('utf8');
				req.body.fileName = req.file.filename;
				req.body.originalFileName = fileNameEncode;
			}
		}
		if (req.body.deleteFileName && !req.file) {
			if (!req.body?.industry) {
				req.body.avatar = CommonConstants.DEFAULT_AVATAR_NAME;
			}
			if (req.body?.industry) {
				req.body.originalFileName = null;
				req.body.fileName = null;
			}
		}
		if (!req.file && !req.body?.file) delete req.body?.file;
		return next.handle();
	}
}
