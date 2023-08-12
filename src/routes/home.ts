import { Response } from '@nbit/bun';
import { defineRoutes } from '../application';

export const home = () => Response.file('public/index.html');

export const favicon = () => Response.file('public/images/favicon.ico');

export default defineRoutes(app => [
    app.get('/', home),
    app.get('/favicon.ico', favicon),
]);
