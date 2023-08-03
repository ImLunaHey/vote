import { join } from 'path';

import { createApplication } from '@nbit/bun';

const { defineRoutes, attachRoutes } = createApplication({
    root: join(import.meta.dir, '..'),
    allowStaticFrom: ['public'],
    getContext: (request) => ({
        auth: async () => {
            const authHeader = request.headers.get('Authorization') ?? '';
            const token = authHeader.startsWith('Bearer')
                ? authHeader.split(' ')[1]
                : undefined;
            return isValidAuthToken(token);
        },
    }),
});

function isValidAuthToken(token: string | undefined) {
    return token === 'some-valid-token';
}

export { defineRoutes, attachRoutes };