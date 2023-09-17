import { readFileSync } from 'fs';
import { Response } from '@nbit/bun';
import { defineRoutes } from '../application';
import { logRequest } from 'src/common/logger';

const indexFile = readFileSync('assets/index.html', 'utf-8');
const faviconFile = readFileSync('assets/images/favicon.ico');
const htmxFile = readFileSync('assets/js/htmx.org@1.9.4.min.js', 'utf-8');

export const index = (request: any) => {
  logRequest(request);
  return new Response(indexFile, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
};

export const favicon = (request: any) => {
  logRequest(request);
  return new Response(faviconFile, {
    headers: {
      'Content-Type': 'image/vnd.microsoft.icon',
    },
  });
};

export const htmx = (request: any) => {
  logRequest(request);
  return new Response(htmxFile, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'max-age: 31536000, immutable',
    },
  });
};

export default defineRoutes((app) => [app.get('/', index), app.get('/favicon.ico', favicon), app.get('/assets/js/htmx.org@1.9.4.min.js', htmx)]);
