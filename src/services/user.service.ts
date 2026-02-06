class Service {
    getSocketRoomForUser = (userId: string) => `user:${userId}`;
}

export const userService = new Service();
