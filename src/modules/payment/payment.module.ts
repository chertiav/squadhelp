import { Module } from '@nestjs/common';

import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { ContestService } from '../contest/contest.service';
import { FileService } from '../file/file.service';

@Module({
	providers: [PaymentService, PrismaService, ContestService, FileService],
	controllers: [PaymentController],
})
export class PaymentModule {}
