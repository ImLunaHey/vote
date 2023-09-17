import { Logger, z, BaseSchema } from '@imlunahey/logger';

const schema = {
    info: {
        request: z.object({
            url: z.string(),
            method: z.string(),
            headers: z.record(z.string()),
        }),
    },
    error: {
        INTERNAL_SERVER_ERROR: z.object({})
    },
} satisfies BaseSchema;

export const logger = new Logger({
    service: 'vote',
    schema,
});

export const logRequest = (request: any) => {
    logger.info('request', {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries([...request.headers.entries()]),
    });
};
