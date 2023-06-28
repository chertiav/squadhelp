import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { AppErrors } from '../common/errors';
import { IErrorBody, ILoggerBody } from '../common/interfaces/exception';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	catch(exception: unknown, host: ArgumentsHost): void {
		const { httpAdapter } = this.httpAdapterHost;

		const ctx = host.switchToHttp();

		const httpStatus: number =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		const httpMessage = (): string => {
			if (exception instanceof HttpException) {
				const messageResponse: any = exception.getResponse();
				if (messageResponse.message) {
					return Array.isArray(messageResponse.message)
						? messageResponse.message.join(', ')
						: messageResponse.message;
				}
				return exception.message;
			}
			return AppErrors.UNINTENDED_INTERNAL_SERVER_ERROR;
		};

		const httpStack: string =
			exception instanceof HttpException ? exception.stack : '';

		const httpHeader: string =
			exception instanceof HttpException
				? exception.name
				: AppErrors.UNINTENDED_INTERNAL_SERVER_ERROR;

		const responseLoggedBody: ILoggerBody = {
			status: httpStatus,
			timestamp: new Date().toISOString(),
			message: httpMessage(),
			stackTrace: httpStack,
		};

		const responseBody: IErrorBody = {
			status: httpStatus,
			name: httpHeader,
			message: httpMessage(),
		};

		httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
	}
}
