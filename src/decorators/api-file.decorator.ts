import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';

export const ApiFile =
	(options?: ApiPropertyOptions): PropertyDecorator =>
	(target: object, propertyKey: string | symbol): void => {
		if (options?.isArray) {
			ApiProperty({
				type: 'array',
				required: false,
				items: {
					type: 'file',
					properties: {
						[propertyKey]: {
							type: 'string',
							format: 'binary',
						},
					},
				},
			})(target, propertyKey);
		} else {
			ApiProperty({
				type: 'file',
				required: false,
				properties: {
					[propertyKey]: {
						type: 'string',
						format: 'binary',
					},
				},
			})(target, propertyKey);
		}
	};
