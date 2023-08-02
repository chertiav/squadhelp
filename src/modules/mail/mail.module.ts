import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
	imports: [
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (
				configService: ConfigService,
			): Promise<MailerOptions> => {
				return {
					transport: {
						host: configService.get<string>('smtpHost'),
						port: configService.get<number>('smtpPort'),
						secure: false,
						auth: {
							user: configService.get<string>('smtpUser'),
							pass: configService.get<string>('smtpPassword'),
						},
					},
					defaults: {
						from: `"No Reply" <${configService.get('smtpUser')}>`,
					},
					template: {
						dir: join(__dirname, '../../../', 'modules/mail/templates'),
						adapter: new HandlebarsAdapter(),
						options: { strict: true },
					},
				};
			},
			inject: [ConfigService],
		}),
	],
	providers: [MailService],
	exports: [MailService],
})
export class MailModule {}
