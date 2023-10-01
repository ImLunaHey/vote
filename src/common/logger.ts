import { Logger, z, BaseSchema } from '@imlunahey/logger';
import { RouteWithParams } from 'xirelta';

const schema = {
    info: {
        request: z.object({
            path: z.string(),
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

export const logRequest = (request: Parameters<RouteWithParams<any, any, any>>[0]) => {
    console.debug(JSON.stringify({
        level: 'debug',
        message: 'request',
        meta: {
            path: request.path,
            method: request.method,
            headers: request.safeHeaders,
        }
    }, null, 0));
};
