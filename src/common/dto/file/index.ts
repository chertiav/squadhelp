import { ApiProperty } from '@nestjs/swagger';
import { ApiFile } from '../../../decorators';
import { IsString } from 'class-validator';

export class FileDto {
	@IsString()
	@ApiProperty({
		description: 'The name of the file to be deleted',
		example: '',
		required: false,
	})
	deleteFileName?: string;

	@ApiFile()
	file?: Express.Multer.File;
}
