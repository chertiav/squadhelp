import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const Paginate = createParamDecorator(
	(_: unknown, ctx: ExecutionContext): string | null => {
		const request = ctx.switchToHttp().getRequest();
		return request?.pagination ? request?.pagination : null;
	},
);
