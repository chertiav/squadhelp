import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class PaginationMiddleware implements NestMiddleware {
	use(req: any, res: any, next: (error?: Error | any) => void): void {
		const { limit, page }: { limit: string; page: string } = req.query;
		req.pagination = {
			take: +limit ?? 8,
			skip: +page * 8,
		};
		next();
	}
}
