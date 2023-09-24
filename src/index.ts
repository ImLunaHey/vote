import { readFileSync } from 'fs';
import chalk from 'chalk';
import { Logger, z } from '@imlunahey/logger';
import { logRequest } from './common/logger';
import { Application } from 'xirelta';

const faviconFile = readFileSync('assets/images/favicon.ico');
const htmxFile = readFileSync('assets/js/htmx.org@1.9.4.min.js', 'utf-8');

const app = new Application({
  logger: new Logger({
    service: 'demo',
    schema: {
      debug: {
        'Registered routes': z.object({
          routes: z.array(z.object({
            path: z.string(),
            method: z.string(),
          }))
        }),
        'Web server closing connections': z.object({
          pendingRequests: z.number(),
          pendingWebSockets: z.number(),
        }),
      },
      info: {
        'Web server started': z.object({ port: z.number() }),
        'Web server stopping': z.object({}),
        'Web server stopped': z.object({}),
      },
    },
  }),
});

// Robots.txt
app.get('/robots.txt', () => new Response('User-agent: *\nAllow: /'));

// HTMX
app.get('/assets/js/htmx.org@1.9.4.min.js', request => {
  console.log('THIS ONE!');
  logRequest(request);
  return new Response(htmxFile, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'max-age: 31536000, immutable',
    },
  });
});

// Favicon
app.get('/favicon.ico', request => {
  logRequest(request);
  return new Response(faviconFile, {
    headers: {
      'Content-Type': 'image/vnd.microsoft.icon',
    },
  });
});

try {
  await app.start();
} catch (error: unknown) {
  console.error(`${chalk.red('Error')}: ${(error as Error).message}`);
  await app.stop();
  process.exit(1);
}
