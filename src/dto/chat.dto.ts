import { ChatDetailParamsDto, CursorPaginationQueryDto } from '@/dto/base.dto';
import { Status, STATUS } from '@/types/app';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class GetListChatQueryDto extends CursorPaginationQueryDto<string> {}

export class CreateChatBodyDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString({ each: true })
    memberIds: string[];
}

export class UpdateChatParamsDto extends ChatDetailParamsDto {}
export class UpdateChatBodyDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;
}

export class DeleteChatParamsDto extends ChatDetailParamsDto {}

export class UpdateChatStatusParamsDto extends ChatDetailParamsDto {}
export class UpdateChatStatusBodyDto {
    @IsString()
    @IsEnum(STATUS)
    status: Status;
}
