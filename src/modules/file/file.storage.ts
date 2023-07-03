import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { diskStorage, StorageEngine } from 'multer';
import { Request } from 'express';
import { join } from 'path';
import * as uuid from 'uuid';
import * as fs from 'fs';

import * as config from '../../configuration/app';

const filePath: string = join(config.default().staticPath, 'files');

try {
	if (!fs.existsSync(filePath)) {
		console.log(fs.existsSync(filePath));
		fs.mkdirSync(filePath, { recursive: true });
	}
} catch (e) {
	throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
}

const storageFiles: StorageEngine = diskStorage({
	destination(req: Request, file: Express.Multer.File, cb): void {
		cb(null, filePath);
	},
	filename(req: Request, file: Express.Multer.File, cb): void {
		const fileExtension: string = file.originalname.split('.').pop();
		const fileName: string = uuid.v4() + '.' + fileExtension;
		cb(null, fileName);
	},
});

const filterImage = (
	req: Request,
	file: Express.Multer.File,
	cb: (Error, boolean) => void,
): void => {
	const MIMETYPE_REGEXP = /^image\/(jpeg|jpg|png|gif)$/;
	MIMETYPE_REGEXP.test(file.mimetype)
		? cb(null, true)
		: cb(new BadRequestException('Invalid file format'), false);
};
export const imageStorage: {
	storage: StorageEngine;
	fileFilter: (req, file, cb) => void;
} = {
	storage: storageFiles,
	fileFilter: filterImage,
};
