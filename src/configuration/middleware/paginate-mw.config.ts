import { RequestMethod } from '@nestjs/common';

export const paginateMwConfig: { path: string; method: RequestMethod }[] = [
	{
		path: 'contest/customer',
		method: RequestMethod.GET,
	},
	{
		path: 'contest/creator',
		method: RequestMethod.GET,
	},
];
