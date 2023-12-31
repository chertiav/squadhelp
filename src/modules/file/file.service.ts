import {
	BadRequestException,
	HttpException,
	HttpStatus,
	Injectable,
	StreamableFile,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { join } from 'path';
import { createReadStream } from 'fs';

import { AppErrors } from '../../common/errors';

@Injectable()
export class FileService {
	constructor(private readonly configService: ConfigService) {}

	public removeFile(fileName: string): void {
		const filePath: string = this.getFilePath(fileName);
		try {
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public getFile(fileName: string): StreamableFile | BadRequestException {
		const filePath: string = this.getFilePath(fileName);
		if (!fs.existsSync(filePath)) {
			throw new BadRequestException(AppErrors.THIS_FILE_DOES_NOT_EXIST);
		}
		const file: fs.ReadStream = createReadStream(this.getFilePath(fileName));
		return new StreamableFile(file);
	}
	public removeAllFiles(): void {
		fs.readdir(
			join(this.getFilePath()),
			(err: NodeJS.ErrnoException, files: string[]): void => {
				for (const file of files) {
					fs.unlink(this.getFilePath(file), (err) => {
						if (err)
							throw new HttpException(
								err.message,
								HttpStatus.INTERNAL_SERVER_ERROR,
							);
					});
				}
			},
		);
	}

	private getFilePath(fileName?: string): string {
		const staticPath: string = this.configService.get<string>('staticPath');
		return fileName
			? join(staticPath, 'files', fileName)
			: join(staticPath, 'files');
	}
}
