import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TokenService } from './token.service';

@Module({
	imports: [
		PassportModule.register({
			defaultStrategy: 'jwt',
			property: 'user',
			session: false,
		}),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>('secret'),
				signOptions: {
					expiresIn: configService.get<string>('expireJwt'),
				},
			}),
			inject: [ConfigService],
		}),
	],
	providers: [TokenService, JwtService],
	exports: [TokenService],
})
export class TokenModule {}
