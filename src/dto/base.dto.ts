import { Type } from 'class-transformer';
import { IsDefined, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class ChatDetailParamsDto {
    @IsDefined()
    @IsString()
    chatId: string;
}

export class OffsetPaginationQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Max(50)
    @Min(1)
    pageSize?: number;
}

export class CursorPaginationQueryDto<T> {
    @IsOptional()
    @IsString()
    cursor?: T;
}
