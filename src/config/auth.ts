export type AuthConfig = {
    jwtSecret: string;
    authServiceUrl: string;
};

export const authConfig: AuthConfig = {
    jwtSecret: process.env.BE_APP_JWT_SECRET || 'default_jwt_secret',
    authServiceUrl: process.env.BE_APP_AUTH_SERVICE_URL || 'http://127.0.0.1:4000',
};
