import { ExamplesObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export interface IChangeRating {
	value: {
		offerId: string;
		creatorId: string;
		mark: number;
		isFirst: boolean;
	};
}

export interface IExamplesChangeRating extends ExamplesObject {
	'first grade': IChangeRating;
	'subsequent evaluations': IChangeRating;
}
