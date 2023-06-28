export default () => ({
	port: process.env.PORT,
	secret: process.env.SECRET_JWT,
	expireJwt: process.env.JWT_EXPIRE,
});
