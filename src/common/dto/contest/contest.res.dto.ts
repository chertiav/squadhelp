import { ContestType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

class countOffers {
	@ApiProperty({ description: 'Number of active offers', example: 1 })
	offers: number;
}

export class Contest {
	@ApiProperty({ description: "Client's active competition ID", example: 1 })
	id: number;

	@ApiProperty({
		description: 'Name of an active customer contest',
		example: 'Name of contest',
	})
	title: string;

	@ApiProperty({
		description: 'Type of an active customer contest',
		example: 'name',
	})
	contestType: ContestType | null;

	@ApiProperty({
		description: 'Type of name an active customer contest',
		example: 'Company',
	})
	typeOfName: string | null;

	@ApiProperty({
		description: "Corporate identity type of the client's active competition",
		example: null,
	})
	brandStyle: string | null;

	@ApiProperty({
		description: 'Type of typeOfTagline an active customer contest',
		example: null,
	})
	typeOfTagline: string | null;

	@ApiProperty({
		description: 'Date of start contest',
		example: '2023-07-05T18:39:42.143Z',
	})
	createdAt: string;

	@ApiProperty({
		description: 'Prize money of the competition',
		example: '100',
	})
	price: string;

	@ApiProperty()
	_count: countOffers;
}

export class ContestResDto {
	@ApiProperty({
		description: 'List of contests',
		isArray: true,
	})
	contests: Contest;

	@ApiProperty({ description: 'Number of active contests', example: 1 })
	totalCount: number;
}
