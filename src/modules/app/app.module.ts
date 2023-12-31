import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import configuration from '../../configuration/app';
import { paginateMwConfig } from '../../configuration/middleware';
import { PaginationMiddleware } from '../../middleware';
import { TokenModule } from '../token/token.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { FileModule } from '../file/file.module';
import { TasksModule } from '../tasks/tasks.module';
import { ContestModule } from '../contest/contest.module';
import { PaymentModule } from '../payment/payment.module';
import { OfferModule } from '../offer/offer.module';
import { MailModule } from '../mail/mail.module';
import { RatingModule } from '../rating/rating.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [configuration],
		}),
		ScheduleModule.forRoot(),
		FileModule,
		TasksModule,
		TokenModule,
		AuthModule,
		UserModule,
		ContestModule,
		PaymentModule,
		OfferModule,
		MailModule,
		RatingModule,
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(PaginationMiddleware).forRoutes(...paginateMwConfig);
	}
}
