import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

import { CommonConstants } from '../common/constants';
import { fileNameEncode } from '../common/helpers';

@Injectable()
export class OneFileInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const ctx: HttpArgumentsHost = context.switchToHttp();
		const req = ctx.getRequest();
		const checkFileForAvatar: boolean =
			!req.body?.industry && !req.body?.contestId;
		const checkFileForContests: boolean =
			req.body?.industry || req.body?.contestId;
		if (req.body && req.file) {
			if (checkFileForAvatar) {
				req.body.avatar = req.file.filename;
			}
			if (checkFileForContests) {
				req.body.fileName = req.file.filename;
				req.body.originalFileName = fileNameEncode(req.file.originalname);
			}
		}
		if (req.body.deleteFileName && !req.file) {
			if (checkFileForAvatar) {
				req.body.avatar = CommonConstants.DEFAULT_AVATAR_NAME;
			}
			if (checkFileForContests) {
				req.body.originalFileName = null;
				req.body.fileName = null;
			}
		}
		if (!req.file && !req.body?.file) delete req.body?.file;
		return next.handle();
	}
}
