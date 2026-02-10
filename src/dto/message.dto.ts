import { ChatDetailParamsDto, CursorPaginationQueryDto } from '@/dto/base.dto';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class GetMessageInChatParamsDto extends ChatDetailParamsDto {}
export class GetMessageInChatQueryDto extends CursorPaginationQueryDto<string> {}

export class SendMessageInChatParamsDto extends ChatDetailParamsDto {}
export class SendMessageInChatBodyDto {
    @IsDefined()
    @IsString()
    @IsNotEmpty()
    content: string;
}

export class EditMessageInChatParamsDto extends ChatDetailParamsDto {
    @IsDefined()
    @IsString()
    messageId: string;
}
export class EditMessageInChatBodyDto {
    @IsDefined()
    @IsString()
    @IsNotEmpty()
    content: string;
}

export class DeleteMessageFromChatParamsDto extends ChatDetailParamsDto {
    @IsDefined()
    @IsString()
    messageId: string;
}
