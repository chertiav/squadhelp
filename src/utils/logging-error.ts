import { format } from 'date-fns';
import { join } from 'path';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';

import * as config from '../configuration/app';
import { CommonConstants } from '../common/constants';

export const loggingError = async (objectError: string): Promise<void> => {
	const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss');
	const logItem = `${dateTime}\t${uuid()}\t${objectError}\n`;

	const staticPath: string = config.default().staticPath;
	const filePath: string = join(staticPath, CommonConstants.LOG_FILE.PATH);
	const fileNamePath: string = join(filePath, CommonConstants.LOG_FILE.NAME);

	try {
		if (!fs.existsSync(filePath)) {
			await fs.promises.mkdir(filePath);
		}
		await fs.promises.appendFile(fileNamePath, logItem);
	} catch (error) {
		console.info(`Error append file: ${error.message}`);
	}
};
