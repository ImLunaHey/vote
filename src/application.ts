import { fileURLToPath } from 'url';
import { join } from 'path';
import { createApplication } from '@nbit/bun';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const { defineRoutes, attachRoutes, createRequestHandler } = createApplication({
    root: join(__dirname, '..'),
    allowStaticFrom: ['public'],
});

export { defineRoutes, attachRoutes, createRequestHandler };
