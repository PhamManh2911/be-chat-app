import { IsDefined, IsOptional, IsString } from 'class-validator';

export class ChatDetailParamsDto {
    @IsDefined()
    @IsString()
    chatId: string;
}

export class OffsetPaginationQueryDto {
    @IsOptional()
    @IsString()
    page?: string;

    @IsOptional()
    @IsString()
    pageSize?: string;
}

export class CursorPaginationQueryDto<T> {
    @IsOptional()
    @IsString()
    cursor?: T;
}
