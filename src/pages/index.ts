import { logRequest } from '../common/logger';
import { RouteWithParams } from 'xirelta';

export const get: RouteWithParams<'GET', '/'> = (request) => {
    logRequest(request);
    return new Response(Bun.file('assets/index.html'), {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
        },
    });
};
