import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import configuration from '../../configuration/app';
import { TokenModule } from '../token/token.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { FileModule } from '../file/file.module';
import { TasksModule } from '../tasks/tasks.module';

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
	],
})
export class AppModule {}
