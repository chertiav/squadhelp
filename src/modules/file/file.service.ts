import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class FileService {
	constructor(private readonly configService: ConfigService) {}

	public removeFile(fileName: string): void {
		const staticPath: string = this.configService.get<string>('staticPath');
		const filePath: string = join(staticPath, 'files', fileName);
		try {
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		} catch (e) {
			throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
