import { Response } from '@nbit/bun';
import { defineRoutes } from '../application';

export const index = () => Response.file('assets/index.html');
export const favicon = () => Response.file('assets/images/favicon.ico');
export const htmx = () =>
  Response.file('assets/js/htmx.org@1.9.4.min.js', {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'max-age: 31536000, immutable',
    },
  });

export default defineRoutes((app) => [app.get('/', index), app.get('/favicon.ico', favicon), app.get('/assets/js/htmx.org@1.9.4.min.js', htmx)]);
