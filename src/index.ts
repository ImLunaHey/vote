import { logRequest } from './common/logger';
import { Application } from 'xirelta';

const app = new Application({
  logger: {
    debug(message: string, meta: Record<string, unknown>) {
      console.debug(JSON.stringify({ level: 'debug', message, meta }, null, 0));
    },
    info(message: string, meta: Record<string, unknown>) {
      console.info(JSON.stringify({ level: 'info', message, meta }, null, 0));
    },
    error(message: string, meta: Record<string, unknown>) {
      console.error(JSON.stringify({ level: 'error', message, meta }, null, 0));
    },
  },
});

// Robots.txt
app.get('/robots.txt', request => {
  logRequest(request);
  return new Response('User-agent: *\nAllow: /');
});

// HTMX
app.get('/assets/js/htmx.org@1.9.4.min.js', request => {
  logRequest(request);
  return new Response(Bun.file('assets/js/htmx.org@1.9.4.min.js'), {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'max-age: 31536000, immutable',
    },
  });
});

// Favicon
app.get('/favicon.ico', request => {
  logRequest(request);
  return new Response(Bun.file('assets/images/favicon.ico'), {
    headers: {
      'Content-Type': 'image/vnd.microsoft.icon',
    },
  });
});

try {
  await app.start();
} catch (error: unknown) {
  app.logger.error('Application crashed', { error });
  await app.stop();
  process.exit(1);
}
