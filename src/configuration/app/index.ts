import { join } from 'path';
import { IConfiguration } from '../../common/interfaces/configuration/app';
export default (): IConfiguration => ({
	port: process.env.PORT,
	secret: process.env.SECRET_JWT,
	expireJwt: process.env.JWT_EXPIRE,
	staticPath: join(__dirname, '../../../../../', process.env.STATIC_PATH),
});
