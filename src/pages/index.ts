import { readFileSync } from 'fs';
import { logRequest } from '../common/logger';
import { RouteWithParams } from 'xirelta';

const indexFile = readFileSync('assets/index.html');

export const get: RouteWithParams<'GET', '/'> = (request) => {
    logRequest(request);
    return new Response(indexFile, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
        },
    });
};
