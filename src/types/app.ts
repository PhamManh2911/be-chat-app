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
