import { ChatDetailParamsDto, OffsetPaginationQueryDto } from '@/dto/base.dto';
import { IsDefined, IsString } from 'class-validator';

export class AddUserToChatParamsDto extends ChatDetailParamsDto {}
export class AddUserToChatBodyDto {
    @IsDefined()
    @IsString()
    userId: string;
}

export class GetUsersInChatParamsDto extends ChatDetailParamsDto {}
export class GetUsersInChatQueryDto extends OffsetPaginationQueryDto {}

export class RemoveUserFromChatParamsDto extends ChatDetailParamsDto {
    @IsDefined()
    @IsString()
    userId: string;
}
