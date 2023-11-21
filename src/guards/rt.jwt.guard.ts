import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JWTRtAuthGuard extends AuthGuard('jwt-refresh') {}
