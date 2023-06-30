import { IsEmail, IsNotEmpty, IsStrongPassword, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class LoginUserDto {
	@ApiProperty({
		description: 'The email address of the User',
		example: 'ragnar@gmail.com',
	})
	@IsNotEmpty()
	@IsEmail()
	readonly email: string;

	@ApiProperty({
		description: 'The password of the User',
		example: 'Ragnar123+',
	})
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
