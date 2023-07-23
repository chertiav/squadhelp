import { Module } from '@nestjs/common';

import { ContestService } from './contest.service';
import { ContestController } from './contest.controller';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';

@Module({
	providers: [ContestService, PrismaService, FileService],
	controllers: [ContestController],
	exports: [ContestService],
})
export class ContestModule {}
