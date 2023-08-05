import { join } from 'path';
import { createApplication } from '@nbit/bun';

const { defineRoutes, attachRoutes } = createApplication({
    root: join(import.meta.dir, '..'),
    allowStaticFrom: ['public'],
});

export { defineRoutes, attachRoutes };
