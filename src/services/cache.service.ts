class Service {
    public getIdempotentProcessFromNs = (ns: string, iKey: string) =>
        `${ns}:idempotency-key:${iKey}`;
}

export const cacheService = new Service();
