import { Logger, z, BaseSchema } from '@imlunahey/logger';
import { RouteWithParams } from 'xirelta';

const schema = {
    info: {
        'Web server started': z.object({ port: z.number() }),
        'Web server stopping': z.object({}),
        'Web server stopped': z.object({}),
        request: z.object({
            path: z.string(),
            method: z.string(),
            headers: z.record(z.string()),
        }),
    },
    error: {
        INTERNAL_SERVER_ERROR: z.object({})
    },
    debug: {
        'Registered routes': z.object({
            routes: z.array(z.object({
                path: z.string(),
                method: z.string(),
            }))
        }),
        'Web server closing connections': z.object({
            pendingRequests: z.number(),
            pendingWebSockets: z.number(),
        }),
    },
} satisfies BaseSchema;

export const logger = new Logger({
    service: 'vote',
    schema,
});

export const logRequest = (request: Parameters<RouteWithParams<any, any, any>>[0]) => {
    logger.info('request', {
        path: request.path,
        method: request.method,
        headers: request.safeHeaders,
    });
};
