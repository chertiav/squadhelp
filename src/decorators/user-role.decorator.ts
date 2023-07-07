import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const UserRole = createParamDecorator(
	(_: unknown, ctx: ExecutionContext): string | null => {
		const request = ctx.switchToHttp().getRequest();
		return request.user?.role ? request.user.role : null;
	},
);
