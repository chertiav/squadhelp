import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import MailMessage from 'nodemailer/lib/mailer/mail-message';
import * as SMTPTransport from 'nodemailer/lib/smtp-transport';

import { AppModule } from '../../src/modules/app/app.module';
import { MailService } from '../../src/modules/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { AppMessages } from '../../src/common/messages';

function spyOnSmtpSend(onMail: (mail: MailMessage) => void) {
	return jest
		.spyOn(SMTPTransport.prototype, 'send')
		.mockImplementation(function (
			mail: MailMessage,
			callback: (
				err: Error | null,
				info: SMTPTransport.SentMessageInfo,
			) => void,
		): void {
			onMail(mail);
			callback(null, {
				envelope: {
					from: mail.data.from as string,
					to: [mail.data.to as string],
				},
				messageId: 'ABCD',
				accepted: [],
				rejected: [],
				pending: [],
				response: 'ok',
			});
		});
}

const castingStringToOneType = (htmlString: string): string =>
	htmlString
		.replace(/[\\n\\t]/g, '')
		.replace(/"/g, "'")
		.replace(/\s+/g, '');

describe('Mail service', (): void => {
	let app: INestApplication;
	let mailService: MailService;
	let configService: ConfigService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		app = moduleFixture.createNestApplication();
		mailService = app.get<MailService>(MailService);
		configService = app.get<ConfigService>(ConfigService);
		await app.init();
	});

	afterAll(async (): Promise<void> => {
		await app.close();
	});

	it(`should send email to moderator, with message ${AppMessages.MSG_EMAIL_CREATE_OFFER_FOR_MODERATOR} & empty field originalFileName`, async () => {
		let lastMail: MailMessage;
		const send = spyOnSmtpSend((mail: MailMessage): void => {
			lastMail = mail;
		});
		const emailSendMail = 'user1@example.test';
		const messageSendMail = AppMessages.MSG_EMAIL_CREATE_OFFER_FOR_MODERATOR;

		const dataSendMail = {
			text: 'text',
			originalFileName: '',
			title: 'title',
			firstName: 'firstName',
			lastName: 'lastName',
		};

		const expectedHtml = `
			<html>
				<head></head>
				<body>
				<p>${messageSendMail}, contest: </p>
				<div
					style='display: flex; flex-direction: row; box-sizing: border-box; margin: 15px 0; color: #556da5; font-size: 20px;'>
					<span>Title: ${dataSendMail.title}</span>
					<span>, Customer: ${dataSendMail.firstName} ${dataSendMail.lastName}</span>
				</div>
				<div
					style='display: flex; flex-direction: row; box-sizing: border-box; width: min-content; margin-top: 15px; 
							padding: 30px 40px; background-color: #f9fafb; border-radius: 10px;'
				>
							<span style='color: #556da5; font-size: 18px; width: max-content;'>
								Text offer: ${dataSendMail.text}
							</span>
				</div>
				<p>If you did not request this email you can safely ignore it.</p>
				</body>
			</html>
		`;

		await mailService.sendMail(emailSendMail, messageSendMail, dataSendMail);

		expect(send).toHaveBeenCalled();
		expect(lastMail.mailer.options).toHaveProperty(
			'host',
			configService.get<string>('smtpHost'),
		);
		expect(lastMail.mailer.options).toHaveProperty(
			'port',
			configService.get<number>('smtpPort'),
		);
		expect(lastMail.mailer.options).toHaveProperty('secure', false);
		expect(lastMail.mailer.options).toHaveProperty('auth', {
			user: configService.get<string>('smtpUser'),
			pass: configService.get<string>('smtpPassword'),
		});

		expect(lastMail.data.from).toBe(
			`"No Reply" <${configService.get('smtpUser')}>`,
		);
		expect(lastMail.data.to).toBe(emailSendMail);
		expect(lastMail.data.subject).toBe('Offer Information');
		expect(lastMail.data).toHaveProperty('context', {
			message: messageSendMail,
			text: dataSendMail.text,
			originalFileName: dataSendMail.originalFileName,
			title: dataSendMail.title,
			firstName: dataSendMail.firstName,
			lastName: dataSendMail.lastName,
			flagMailNotForCustomer: true,
		});
		expect(castingStringToOneType(lastMail.data.html.toString())).toBe(
			castingStringToOneType(expectedHtml),
		);
	});

	it(`should send email to moderator, with message ${AppMessages.MSG_EMAIL_CREATE_OFFER_FOR_MODERATOR} & filled field originalFileName`, async () => {
		let lastMail: MailMessage;
		const send = spyOnSmtpSend((mail: MailMessage): void => {
			lastMail = mail;
		});
		const emailSendMail = 'user1@example.test';
		const messageSendMail = AppMessages.MSG_EMAIL_CREATE_OFFER_FOR_MODERATOR;

		const dataSendMail = {
			text: '',
			originalFileName: 'originalFileName',
			title: 'title',
			firstName: 'firstName',
			lastName: 'lastName',
		};

		const expectedHtml = `
			<html>
				<head></head>
				<body>
					<p>${messageSendMail}, contest: </p>
					<div style="display: flex; flex-direction: row; box-sizing: border-box; margin: 15px 0; color: #556da5; font-size: 20px;">
						<span>Title: ${dataSendMail.title}</span>
						<span>, Customer: ${dataSendMail.firstName} ${dataSendMail.lastName}</span>
					</div>
					<div
						style="display: flex; flex-direction: row; box-sizing: border-box; width: min-content; margin-top: 15px;
						padding: 30px 40px; background-color: #f9fafb; border-radius: 10px;"
					>
						<span style="color: #556da5; font-size: 18px; width: max-content;">
							File width name: ${dataSendMail.originalFileName}
						</span>
					</div>
					<p>If you did not request this email you can safely ignore it.</p>
				</body>
			</html>`;

		await mailService.sendMail(emailSendMail, messageSendMail, dataSendMail);

		expect(send).toHaveBeenCalled();
		expect(lastMail.mailer.options).toHaveProperty(
			'host',
			configService.get<string>('smtpHost'),
		);
		expect(lastMail.mailer.options).toHaveProperty(
			'port',
			configService.get<number>('smtpPort'),
		);
		expect(lastMail.mailer.options).toHaveProperty('secure', false);
		expect(lastMail.mailer.options).toHaveProperty('auth', {
			user: configService.get<string>('smtpUser'),
			pass: configService.get<string>('smtpPassword'),
		});

		expect(lastMail.data.from).toBe(
			`"No Reply" <${configService.get('smtpUser')}>`,
		);
		expect(lastMail.data.to).toBe(emailSendMail);
		expect(lastMail.data.subject).toBe('Offer Information');
		expect(lastMail.data).toHaveProperty('context', {
			message: messageSendMail,
			text: dataSendMail.text,
			originalFileName: dataSendMail.originalFileName,
			title: dataSendMail.title,
			firstName: dataSendMail.firstName,
			lastName: dataSendMail.lastName,
			flagMailNotForCustomer: true,
		});
		expect(castingStringToOneType(lastMail.data.html.toString())).toBe(
			castingStringToOneType(expectedHtml),
		);
	});

	it(`should send email to creator, with message ${AppMessages.MSG_EMAIL_MODERATOR_REJECT} & filled field originalFileName`, async () => {
		let lastMail: MailMessage;
		const send = spyOnSmtpSend((mail: MailMessage): void => {
			lastMail = mail;
		});
		const emailSendMail = 'user1@example.test';
		const messageSendMail = AppMessages.MSG_EMAIL_MODERATOR_REJECT;

		const dataSendMail = {
			text: '',
			originalFileName: 'originalFileName',
			title: 'title',
			firstName: 'firstName',
			lastName: 'lastName',
		};

		const expectedHtml = `
			<html>
				<head></head>
				<body>
					<p>${messageSendMail}, contest: </p>
					<div style="display: flex; flex-direction: row; box-sizing: border-box; margin: 15px 0; color: #556da5; font-size: 20px;">
						<span>Title: ${dataSendMail.title}</span>
						<span>, Customer: ${dataSendMail.firstName} ${dataSendMail.lastName}</span>
					</div>
					<div
						style="display: flex; flex-direction: row; box-sizing: border-box; width: min-content; margin-top: 15px;
						padding: 30px 40px; background-color: #f9fafb; border-radius: 10px;"
					>
						<span style="color: #556da5; font-size: 18px; width: max-content;">
							File width name: ${dataSendMail.originalFileName}
						</span>
					</div>
					<p>If you did not request this email you can safely ignore it.</p>
				</body>
			</html>`;

		await mailService.sendMail(emailSendMail, messageSendMail, dataSendMail);

		expect(send).toHaveBeenCalled();
		expect(lastMail.mailer.options).toHaveProperty(
			'host',
			configService.get<string>('smtpHost'),
		);
		expect(lastMail.mailer.options).toHaveProperty(
			'port',
			configService.get<number>('smtpPort'),
		);
		expect(lastMail.mailer.options).toHaveProperty('secure', false);
		expect(lastMail.mailer.options).toHaveProperty('auth', {
			user: configService.get<string>('smtpUser'),
			pass: configService.get<string>('smtpPassword'),
		});

		expect(lastMail.data.from).toBe(
			`"No Reply" <${configService.get('smtpUser')}>`,
		);
		expect(lastMail.data.to).toBe(emailSendMail);
		expect(lastMail.data.subject).toBe('Offer Information');
		expect(lastMail.data).toHaveProperty('context', {
			message: messageSendMail,
			text: dataSendMail.text,
			originalFileName: dataSendMail.originalFileName,
			title: dataSendMail.title,
			firstName: dataSendMail.firstName,
			lastName: dataSendMail.lastName,
			flagMailNotForCustomer: true,
		});
		expect(castingStringToOneType(lastMail.data.html.toString())).toBe(
			castingStringToOneType(expectedHtml),
		);
	});

	it(`should send email to customer, with message ${AppMessages.MSG_EMAIL_MODERATOR_ACTIVE_FOR_CUSTOMER} & empty field originalFileName`, async () => {
		let lastMail: MailMessage;
		const send = spyOnSmtpSend((mail: MailMessage): void => {
			lastMail = mail;
		});
		const emailSendMail = 'user1@example.test';
		const messageSendMail = AppMessages.MSG_EMAIL_MODERATOR_ACTIVE_FOR_CUSTOMER;

		const dataSendMail = {
			text: 'text',
			originalFileName: '',
			title: 'title',
			firstName: 'firstName',
			lastName: 'lastName',
		};

		const expectedHtml = `
			<html>
				<head></head>
				<body>
					<p>${messageSendMail}, contest: </p>
					<div style="display: flex; flex-direction: row; box-sizing: border-box; margin: 15px 0; color: #556da5; font-size: 20px;">
						<span>Title: ${dataSendMail.title}</span>
					</div>
					<div
						style="display: flex; flex-direction: row; box-sizing: border-box; width: min-content; margin-top: 15px;
						padding: 30px 40px; background-color: #f9fafb; border-radius: 10px;"
					>
						<span style="color: #556da5; font-size: 18px; width: max-content;">
							Text offer: ${dataSendMail.text}
						</span>
					</div>
					<p>If you did not request this email you can safely ignore it.</p>
				</body>
			</html>`;

		await mailService.sendMail(emailSendMail, messageSendMail, dataSendMail);

		expect(send).toHaveBeenCalled();
		expect(lastMail.mailer.options).toHaveProperty(
			'host',
			configService.get<string>('smtpHost'),
		);
		expect(lastMail.mailer.options).toHaveProperty(
			'port',
			configService.get<number>('smtpPort'),
		);
		expect(lastMail.mailer.options).toHaveProperty('secure', false);
		expect(lastMail.mailer.options).toHaveProperty('auth', {
			user: configService.get<string>('smtpUser'),
			pass: configService.get<string>('smtpPassword'),
		});

		expect(lastMail.data.from).toBe(
			`"No Reply" <${configService.get('smtpUser')}>`,
		);
		expect(lastMail.data.to).toBe(emailSendMail);
		expect(lastMail.data.subject).toBe('Offer Information');
		expect(lastMail.data).toHaveProperty('context', {
			message: messageSendMail,
			text: dataSendMail.text,
			originalFileName: dataSendMail.originalFileName,
			title: dataSendMail.title,
			firstName: dataSendMail.firstName,
			lastName: dataSendMail.lastName,
			flagMailNotForCustomer: false,
		});
		expect(castingStringToOneType(lastMail.data.html.toString())).toBe(
			castingStringToOneType(expectedHtml),
		);
	});
});
