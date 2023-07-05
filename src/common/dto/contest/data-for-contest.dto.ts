import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DataForContestDto {
	@ApiProperty({
		description: 'Type of contest',
		example: 'nameStyle',
	})
	@IsString()
	@IsNotEmpty()
	characteristic1: string;

	@ApiProperty({
		description: 'Type of contest',
		example: 'typeOfName',
	})
	@IsString()
	@IsNotEmpty()
	characteristic2: string;
}
