import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import { ConfigSwagger } from '../../configuration/swagger';

export function createDocument(app: INestApplication): OpenAPIObject {
	const builder: DocumentBuilder = new DocumentBuilder()
		.setTitle(ConfigSwagger.title)
		.setDescription(ConfigSwagger.description)
		.setVersion(ConfigSwagger.version)
		.addCookieAuth('token', { type: 'apiKey' });

	const options: Omit<OpenAPIObject, 'paths'> = builder.build();

	return SwaggerModule.createDocument(app, options);
}
