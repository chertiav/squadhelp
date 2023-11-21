export interface IConfiguration {
	port: string;
	secret: string;
	expireJwt: string;
	secretRt: string;
	expireRtJwt: string;
	staticPath: string;
	smtpHost: string;
	smtpPort: string;
	smtpUser: string;
	smtpPassword: string;
}
