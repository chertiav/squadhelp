import { Module } from '@nestjs/common';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';

@Module({
	providers: [
		OfferService,
		PrismaService,
		FileService,
		UserService,
		MailService,
	],
	controllers: [OfferController],
})
export class OfferModule {}
