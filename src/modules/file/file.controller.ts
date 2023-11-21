import {
	BadRequestException,
	Controller,
	Get,
	Param,
	Res,
	StreamableFile,
	UseGuards,
	Version,
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiInternalServerErrorResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import {
	BadRequestExceptionResDto,
	InternalServerErrorExceptionResDto,
	UnauthorizedExceptionResDto,
} from '../../common/dto/exception';
import { Roles } from '../../decorators';
import { Role } from '@prisma/client';
import { JWTAuthGuard, RolesGuard } from '../../guards';
import { FileService } from './file.service';

@ApiTags('file')
@Controller('file')
export class FileController {
	constructor(private readonly fileService: FileService) {}

	@ApiOperation({ description: 'Get file' })
	@ApiUnauthorizedResponse({
		description: 'Unauthorized message',
		type: UnauthorizedExceptionResDto,
	})
	@ApiBadRequestResponse({
		description: 'Invalid request data message',
		type: BadRequestExceptionResDto,
	})
	@ApiInternalServerErrorResponse({
		description: 'Internal server error message',
		type: InternalServerErrorExceptionResDto,
	})
	@ApiOkResponse({
		schema: {
			type: 'string',
			format: 'binary',
		},
	})
	@ApiBearerAuth()
	@Roles(Role.creator)
	@UseGuards(JWTAuthGuard, RolesGuard)
	@Version('1')
	@Get(':fileName')
	getFile(
		@Res({ passthrough: true }) res: Response,
		@Param('fileName') fileName: string,
	): StreamableFile | BadRequestException {
		return this.fileService.getFile(fileName);
	}
}
