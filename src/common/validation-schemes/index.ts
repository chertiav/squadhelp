import * as Joi from 'joi';

export const paginateSchema: Joi.ObjectSchema<any> = Joi.object().keys({
	limit: Joi.number().min(1).max(8).required(),
	page: Joi.number().min(0).required(),
});
