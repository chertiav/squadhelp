import { IsEmail, IsNotEmpty, IsStrongPassword, Length } from 'class-validator';
export class LoginUserDto {
	@IsNotEmpty()
	@IsEmail()
	readonly email: string;

	@IsNotEmpty()
	@Length(4, 24)
	@IsStrongPassword({
		minLowercase: 1,
		minUppercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	readonly password: string;
}
