import { Module } from '@nestjs/common';
import { RatingController } from './rating.controller';
import { RatingService } from './rating.service';
import { OfferService } from '../offer/offer.service';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';

@Module({
	controllers: [RatingController],
	providers: [
		RatingService,
		OfferService,
		PrismaService,
		FileService,
		UserService,
		MailService,
	],
	exports: [RatingService],
})
export class RatingModule {}
