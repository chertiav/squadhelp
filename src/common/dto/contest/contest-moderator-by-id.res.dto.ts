import { ApiProperty } from '@nestjs/swagger';
import { ContestCommonByIdResDto } from './contest-common-by-id.res.dto';

export class ContestModeratorByIdResDto extends ContestCommonByIdResDto {
	@ApiProperty({
		deprecated: true,
	})
	price;
}
