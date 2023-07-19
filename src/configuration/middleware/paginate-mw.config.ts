import { RequestMethod } from '@nestjs/common';

export const paginateMwConfig: {
	version: string;
	path: string;
	method: RequestMethod;
}[] = [{ version: '1', path: 'contest', method: RequestMethod.GET }];
