import { ILoggerBody } from '../common/interfaces/exception';
import { join } from 'path';
import * as fs from 'fs';

import * as config from '../configuration/app';
import { CommonConstants } from '../common/constants';

export const loggingError = (objectError: ILoggerBody): void => {
	const staticPath: string = config.default().staticPath;
	const filePath: string = join(staticPath, CommonConstants.LOG_FILE.PATH);
	const fileNamePath: string = join(filePath, CommonConstants.LOG_FILE.NAME);
	const jsonObjectError: string = JSON.stringify(objectError);

	if (!fs.existsSync(filePath)) {
		fs.mkdirSync(filePath, {
			recursive: true,
		});
	}
	fs.appendFile(
		fileNamePath,
		jsonObjectError + '\n',
		(err: NodeJS.ErrnoException | null): void => {
			if (err) {
				console.info(`Error append file: ${err.message}`);
				return;
			}
		},
	);
};
