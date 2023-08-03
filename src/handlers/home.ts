import { Response } from '@nbit/bun';
import { defineRoutes } from '../application';

export default defineRoutes(app => [
    app.get('/', () => {
        try {
            return Response.file('public/index.html')
        } catch (error) {
            console.error(error);
        }
    }),
    app.get('/images/favicon.ico', () => Response.file('public/images/favicon.ico')),
]);
