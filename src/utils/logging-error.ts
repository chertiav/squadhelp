import { ILoggerBody } from '../common/interfaces/exception';
import { join } from 'path';
import * as fs from 'fs';

import * as config from '../configuration/app';
import { LOG_FILE } from '../common/constants';

export const loggingError = (objectError: ILoggerBody): void => {
	const staticPath: string = config.default().staticPath;
	const filePath: string = join(staticPath, LOG_FILE.logFilePath);
	const fileNamePath: string = join(filePath, LOG_FILE.logFileName);
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
				console.log(`Error: ${err.message}`);
				return;
			}
		},
	);
};
