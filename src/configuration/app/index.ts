import { join } from 'path';
import { IConfiguration } from '../../common/interfaces/configuration/app';
import { env } from 'process';

export default (): IConfiguration => ({
	port: env.PORT,
	secret: env.SECRET_JWT,
	expireJwt: env.JWT_EXPIRE,
	staticPath: join(__dirname, '../../../../../', env.STATIC_PATH),
	smtpHost: env.SMTP_HOST,
	smtpPort: env.SMTP_PORT,
	smtpUser: env.SMTP_USER,
	smtpPassword: env.SMTP_PASSWORD,
});
