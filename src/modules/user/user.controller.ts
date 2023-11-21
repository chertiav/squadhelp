import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Patch,
	UploadedFile,
	UseGuards,
	UseInterceptors,
	Version,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiForbiddenResponse,
	ApiInternalServerErrorResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { Role } from '@prisma/client';
import { AppMessages } from '../../common/messages';
import { imageStorage } from '../file/file.storage';
import { Roles, UserId } from '../../decorators';
import {
	ForbiddenExceptionResDto,
	InternalServerErrorExceptionResDto,
	UnauthorizedExceptionResDto,
} from '../../common/dto/exception';
import { JWTAuthGuard, RolesGuard } from '../../guards';
import { UserService } from './user.service';
import { OneFileInterceptor } from '../../interceptors';
import {
	BalanceUserDto,
	InfoUserDto,
	UpdateUserDto,
	UpdateUserResDto,
} from '../../common/dto/user';

@ApiTags('user')
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiOperation({ description: 'User updating' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'User data for update',
		type: UpdateUserDto,
	})
	@ApiUnauthorizedResponse({
		description: 'Unauthorized message',
		type: UnauthorizedExceptionResDto,
	})
	@ApiInternalServerErrorResponse({
		description: 'Internal server error message',
		type: InternalServerErrorExceptionResDto,
	})
	@ApiOkResponse({
		description: 'User data updated successfully',
		type: UpdateUserResDto,
	})
	@ApiBearerAuth()
	@UseGuards(JWTAuthGuard)
	@HttpCode(HttpStatus.OK)
	@UseInterceptors(
		FileInterceptor('file', {
			...imageStorage,
		}),
		OneFileInterceptor,
	)
	@Version('1')
	@Patch('update')
	async update(
		@UserId() id: number,
		@UploadedFile() file: Express.Multer.File,
		@Body() dto: UpdateUserDto,
	): Promise<UpdateUserResDto> {
		const user: InfoUserDto = await this.userService.updateInfoUser(dto, id);
		return { user, message: AppMessages.MSG_USER_INFORMATION_UPDATED };
	}

	@ApiOperation({ description: 'Get user info' })
	@ApiUnauthorizedResponse({
		description: 'Unauthorized message',
		type: UnauthorizedExceptionResDto,
	})
	@ApiInternalServerErrorResponse({
		description: 'Internal server error message',
		type: InternalServerErrorExceptionResDto,
	})
	@ApiOkResponse({
		description: 'User info data ',
		type: InfoUserDto,
	})
	@ApiBearerAuth()
	@UseGuards(JWTAuthGuard)
	@HttpCode(HttpStatus.OK)
	@Version('1')
	@Get('info')
	async info(@UserId() id: number): Promise<InfoUserDto> {
		return this.userService.getInfoUser(id);
	}

	@ApiOperation({ description: "Getting the user's balance" })
	@ApiUnauthorizedResponse({
		description: 'Unauthorized message',
		type: UnauthorizedExceptionResDto,
	})
	@ApiInternalServerErrorResponse({
		description: 'Internal server error message',
		type: InternalServerErrorExceptionResDto,
	})
	@ApiForbiddenResponse({
		description: 'Access denied message',
		type: ForbiddenExceptionResDto,
	})
	@ApiOkResponse({
		description: "User's balance ",
		type: BalanceUserDto,
	})
	@Roles(Role.creator)
	@ApiBearerAuth()
	@UseGuards(JWTAuthGuard, RolesGuard)
	@Version('1')
	@Get('balance')
	async balance(@UserId() id: number): Promise<BalanceUserDto> {
		return this.userService.getBalanceUser(id);
	}
}
