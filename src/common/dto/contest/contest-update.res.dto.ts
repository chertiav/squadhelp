import { ApiProperty } from '@nestjs/swagger';
import { AppMessages } from '../../messages';
import { ContestCustomerByIdResDto } from './contest-customer-by-id.res.dto';

export class ContestUpdateResDto {
	@ApiProperty()
	contest: ContestCustomerByIdResDto;

	@ApiProperty({
		description: 'Success message',
		example: AppMessages.MSG_CONTEST_INFORMATION_UPDATED,
	})
	message: string;
}
