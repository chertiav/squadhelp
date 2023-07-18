import { RequestMethod } from '@nestjs/common';

export const paginateMwConfig: {
	version: string;
	path: string;
	method: RequestMethod;
}[] = [
	{
		version: '1',
		path: 'contest/cu',
		method: RequestMethod.GET,
	},
	{
		version: '1',
		path: 'contest/cr',
		method: RequestMethod.GET,
	},
	{
		version: '1',
		path: 'contest/mo',
		method: RequestMethod.GET,
	},
];
