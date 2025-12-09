import { ChatDetailParamsDto } from '@/dto/base.dto';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class GetListChatQueryDto {
    @IsOptional()
    @IsDate()
    cursor?: Date;
}

export class CreateChatBodyDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    memberIds?: string[];
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
