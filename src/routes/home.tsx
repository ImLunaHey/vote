import { Response } from '@nbit/bun';
import { defineRoutes } from '../application';

export const home = () => Response.file('assets/index.html');

export const favicon = () => Response.file('assets/images/favicon.ico');
export const htmx = () =>
  Response.file('assets/js/htmx.org@1.9.4.min.js', {
    headers: {
      'content-type': 'application/javascript; charset=utf-8',
    },
  });

export default defineRoutes((app) => [app.get('/', home), app.get('/favicon.ico', favicon), app.get('/assets/js/htmx.org@1.9.4.min.js', htmx)]);
