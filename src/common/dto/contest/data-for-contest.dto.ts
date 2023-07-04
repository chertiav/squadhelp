import { ApiProperty } from '@nestjs/swagger';

export class DataForContestDto {
	@ApiProperty({
		description: 'Type of contest',
		example: 'nameStyle',
	})
	characteristic1: string;

	@ApiProperty({
		description: 'Type of contest',
		example: 'typeOfName',
	})
	characteristic2: string;
}
