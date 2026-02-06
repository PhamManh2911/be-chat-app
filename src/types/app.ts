export abstract class TimeStamps {
    readonly createdAt!: Date;
    readonly updatedAt!: Date;
}

export interface TokenPayload {
    sub: string;
    email: string;
    name: string;
    avatar: string;
}

export type Status = 'active' | 'archived' | 'deleted';

export const STATUS: Record<Uppercase<Status>, Status> = {
    ACTIVE: 'active',
    ARCHIVED: 'archived',
    DELETED: 'deleted',
};

export type SocketData = {
    user: TokenPayload;
};

export type CursorQueryList = {
    limit: number;
    cursor?: string;
};

export type OffsetQueryList = {
    page: number;
    pageSize: number;
};
