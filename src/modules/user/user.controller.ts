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
} from '@nestjs/common';
import {
	ApiBody,
	ApiConsumes,
	ApiCookieAuth,
	ApiInternalServerErrorResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { InfoUserRes, UpdateUserRes } from '../../common/types/response/user';
import { AppMessages } from '../../common/messages';
import { imageStorage } from '../file/file.storage';
import { UserId } from '../../decorators';
import {
	InternalServerErrorExceptionRes,
	UnauthorizedExceptionRes,
} from '../../common/types/response/exception';
import { JWTAuthGuard } from '../../guards';
import { UserService } from './user.service';
import { UpdateFileInterceptor } from '../../interceptors';
import { InfoUserDto, UpdateUserDto } from '../../common/dto/user';

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
		type: UnauthorizedExceptionRes,
	})
	@ApiInternalServerErrorResponse({
		description: 'Internal server error message',
		type: InternalServerErrorExceptionRes,
	})
	@ApiOkResponse({
		description: 'User data updated successfully',
		type: UpdateUserRes,
	})
	@ApiCookieAuth()
	@UseGuards(JWTAuthGuard)
	@HttpCode(HttpStatus.OK)
	@UseInterceptors(
		FileInterceptor('file', {
			...imageStorage,
		}),
		UpdateFileInterceptor,
	)
	@Patch('update')
	async update(
		@UserId() id: number,
		@UploadedFile() file: Express.Multer.File,
		@Body() dto: UpdateUserDto,
	): Promise<UpdateUserRes> {
		const user: InfoUserDto = await this.userService.updateUser(dto, id);
		return { user, message: AppMessages.MSG_USER_INFORMATION_UPDATED };
	}

	@ApiOperation({ description: 'Get user info' })
	@ApiUnauthorizedResponse({
		description: 'Unauthorized message',
		type: UnauthorizedExceptionRes,
	})
	@ApiInternalServerErrorResponse({
		description: 'Internal server error message',
		type: InternalServerErrorExceptionRes,
	})
	@ApiOkResponse({
		description: 'User info data ',
		type: InfoUserRes,
	})
	@ApiCookieAuth()
	@UseGuards(JWTAuthGuard)
	@HttpCode(HttpStatus.OK)
	@Get('info')
	async info(@UserId() id: number): Promise<InfoUserRes> {
		return this.userService.getInfoUser(id);
	}
}
