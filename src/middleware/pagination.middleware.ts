import { Injectable, NestMiddleware } from '@nestjs/common';
import * as Joi from 'joi';

import { paginateSchema } from '../common/validation-schemes';

@Injectable()
export class PaginationMiddleware implements NestMiddleware {
	async use(
		req: any,
		res: any,
		next: (error?: Error | any) => void,
	): Promise<void> {
		const { limit, page }: { limit: number; page: number } = req.query;
		const result: Joi.ValidationResult = await paginateSchema.validate({
			limit,
			page,
		});
		const valid: boolean = result.error == null;
		!valid
			? (req.pagination = { take: 8, skip: 0 })
			: (req.pagination = { take: +limit, skip: +page * 8 });
		console.log(req.pagination);
		next();
	}
}
