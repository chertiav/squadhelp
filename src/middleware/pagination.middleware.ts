import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class PaginationMiddleware implements NestMiddleware {
	use(req: any, res: any, next: (error?: Error | any) => void): void {
		const { limit, offset }: { limit: string; offset: string } = req.query;
		req.pagination = {
			take: +limit ?? 8,
			skip: +offset * 8,
		};
		next();
	}
}
