import {
	BadRequestException,
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { isObject } from 'class-validator';
import { AppErrors } from '../common/errors';
import { fileNameEncode } from '../common/helpers';

@Injectable()
export class FilesPayInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const ctx: HttpArgumentsHost = context.switchToHttp();
		const req = ctx.getRequest();
		const { body } = req;
		body.contests = JSON.parse(body.contests);
		body.contests = body.contests.map((contest) =>
			!isObject(contest) ? JSON.parse(contest) : contest,
		);
		if (req.files.length > body.contests.length)
			throw new BadRequestException(
				AppErrors.NO_MORE_FILES_THAN_THE_NAME_NUMBER_OF_CONTESTS,
			);
		body.contests.forEach((contest): void => {
			if (contest.haveFile) {
				const file = req.files.splice(0, 1);
				contest.fileName = file[0].filename;
				contest.originalFileName = fileNameEncode(file[0].originalname);
			}
			delete contest.haveFile;
		});
		return next.handle();
	}
}
