import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Patch,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBody,
	ApiCookieAuth,
	ApiInternalServerErrorResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { UpdateUserDto } from '../../common/dto/user';
import { InfoUserRes, UpdateUserRes } from '../../common/types/response/user';
import {
	InternalServerErrorExceptionRes,
	UnauthorizedExceptionRes,
} from '../../common/types/response/exception';
import { JWTAuthGuard } from '../../guards';
import { AppMessages } from '../../common/messages';
import { UserId } from '../../decorators';

@ApiTags('user')
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}
	@ApiOperation({ description: 'User updating' })
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
	@Patch('update')
	async update(
		@UserId() id: number,
		@Body() dto: UpdateUserDto,
	): Promise<UpdateUserRes> {
		const user: any = await this.userService.updateUser(dto, id);
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
