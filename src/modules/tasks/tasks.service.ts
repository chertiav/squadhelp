import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { join } from 'path';
import { format } from 'date-fns';
import * as fs from 'fs';

import * as config from '../../configuration/app';
import { CommonConstants } from '../../common/constants';

@Injectable()
export class TasksService {
	private readonly logger: Logger = new Logger(TasksService.name);

	@Cron(CronExpression.EVERY_DAY_AT_8PM, {
		name: 'loggingErrorToFile',
		timeZone: 'Europe/Copenhagen',
	})
	loggingErrorToFile(): void {
		const staticPath: string = config.default().staticPath;
		const logFilePath: string = join(staticPath, CommonConstants.LOG_FILE.PATH);
		const logFileNamePath: string = join(
			logFilePath,
			CommonConstants.LOG_FILE.NAME,
		);
		const logFilePathCurrentDay: string = join(
			logFilePath,
			CommonConstants.LOG_FILE.CURRENT_PATH,
		);

		if (!fs.existsSync(logFilePathCurrentDay)) {
			fs.mkdirSync(logFilePathCurrentDay, {
				recursive: true,
			});
		}

		if (fs.existsSync(logFileNamePath)) {
			fs.readFile(
				logFileNamePath,
				(err: NodeJS.ErrnoException | null, data: Buffer): void => {
					if (err) {
						this.logger.error(err.message);
						return;
					}
					const dateTime = format(new Date(), `yyyy-MM-dd HH_m_ss`).replace(
						' ',
						'T',
					);
					// const date: string = new Date().toISOString().replace(/:/g, '_');
					const file: string = join(logFilePathCurrentDay, `${dateTime}.log`);
					const buffer: string = data.toString('utf-8');
					const arrayData: string[] = buffer.split('\n');
					arrayData
						.filter((item: string): boolean => item.includes('stackTrace'))
						.forEach((item: string): void => {
							const end: number = item.indexOf('stackTrace');
							const str: string = item.slice(0, end);
							fs.appendFile(
								file,
								str + '\n',
								(err: NodeJS.ErrnoException | null): void => {
									if (err) {
										this.logger.error(err.message);
										return;
									}
								},
							);
						});
					fs.truncate(
						logFileNamePath,
						(err: NodeJS.ErrnoException | null): void => {
							if (err) {
								this.logger.error(err.message);
								return;
							}
						},
					);
				},
			);
		}
	}
}
