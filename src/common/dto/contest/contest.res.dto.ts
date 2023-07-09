import { ApiProperty } from '@nestjs/swagger';
import { ContestCommonDto } from './contest.common.dto';

export class ContestResDto {
	@ApiProperty({
		description: 'List of contests',
		isArray: true,
	})
	contests: ContestCommonDto;

	@ApiProperty({ description: 'Number of active contests', example: 1 })
	totalCount: number;
}
