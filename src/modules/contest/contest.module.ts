import { Module } from '@nestjs/common';

import { ContestService } from './contest.service';
import { ContestController } from './contest.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
	providers: [ContestService, PrismaService],
	controllers: [ContestController],
})
export class ContestModule {}
