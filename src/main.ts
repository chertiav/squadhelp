import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './modules/app/app.module';
import { createDocument } from './modules/swagger';
import { AllExceptionsFilter } from './exception';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	const port: string = configService.get<string>('port');
	const staticPath: string = configService.get<string>('staticPath');
	const httpAdapter = app.get(HttpAdapterHost);

	app.use('/public', express.static(staticPath));
	app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
	app.useGlobalPipes(new ValidationPipe());
	app.use(cookieParser());
	app.enableCors({
		credentials: true,
		origin: ['http://localhost:3000'],
	});
	SwaggerModule.setup('api', app, createDocument(app), {
		swaggerOptions: {
			persistAuthorization: true,
		},
	});
	await app.listen(port);
}
bootstrap();
