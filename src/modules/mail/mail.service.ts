import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import { AppMessages } from '../../common/messages';
import { AppErrors } from '../../common/errors';
import { IMailOfferData } from '../../common/interfaces/mail';

@Injectable()
export class MailService {
	constructor(private mailerService: MailerService) {}

	async sendMail(
		email: string | string[],
		message: string,
		data: IMailOfferData,
	): Promise<void> {
		const flagMailNotForCustomer: boolean =
			message !== AppMessages.MSG_EMAIL_MODERATOR_ACTIVE_FOR_CUSTOMER;
		try {
			await this.mailerService.sendMail({
				to: email,
				subject: 'Offer Information',
				template: './offer-information',
				context: {
					message,
					text: data.text,
					originalFileName: data.originalFileName,
					title: data.title,
					firstName: data.firstName,
					lastName: data.lastName,
					flagMailNotForCustomer,
				},
			});
		} catch (e) {
			throw new InternalServerErrorException(AppErrors.MAIL_SENDING_ERROR, {
				cause: e,
			});
		}
	}
}
