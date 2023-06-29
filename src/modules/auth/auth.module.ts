import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PrismaService } from '../prisma/prisma.service';
import { TokenModule } from '../token/token.module';
import { JwtStrategy, LocalStrategy } from '../../strategy';

@Module({
	imports: [UserModule, TokenModule],
	controllers: [AuthController],
	providers: [AuthService, PrismaService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
