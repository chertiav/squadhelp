import { Module } from '@nestjs/common';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';

@Module({
	providers: [OfferService, PrismaService, FileService],
	controllers: [OfferController],
})
export class OfferModule {}
