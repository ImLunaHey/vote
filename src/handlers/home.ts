import { Response } from '@nbit/bun';
import { defineRoutes } from '../application';

export default defineRoutes(app => [
    app.get('/', () => Response.file('public/index.html')),
    app.get('/images/favicon.ico', () => Response.file('public/images/favicon.ico')),
]);
