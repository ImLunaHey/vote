import { Response } from '@nbit/bun';
import { defineRoutes } from '../application';
import { renderPage } from '../common/render';

export const home = () =>
  new Response(
    renderPage(
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Vote</title>
          <link rel="icon" href="/favicon.ico" />
          <style>{`
        :root {
          --left-panel-color: #ff00f7;
          --right-panel-color: #0095f8;
          --middle-color: #ffffff;
        }

        * {
          font-family: monospace;
        }

        body,
        html {
          min-height: 100px;
          min-width: 800px;
          height: 100%;
          margin: 0;
          justify-content: center;
          align-items: center;
          color: black;
        }

        h1,
        h4 {
          margin: 0;
        }

        main {
          position: relative;
          display: flex;
          align-items: center;
          height: 100%;
        }

        button {
          cursor: pointer;
        }

        .panel {
          flex: 1;
          flex-direction: column;
          height: 100%;
          font-size: 18px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: none;
        }

        .left {
          background-color: var(--left-panel-color);
        }

        .right {
          background-color: var(--right-panel-color);
        }

        .middle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: var(--middle-color);
          border-radius: 50%;
          font-size: 18px;
          width: 50px;
          height: 50px;
          text-align: center;
          line-height: 50px;
          border: none;
        }

        .alert {
          background: blueviolet;
          color: white;
        }
      `}</style>
        </head>
        <body>
          <main>
            <button className="right panel" hx-get="/vote" hx-trigger="click" hx-target="main" hx-swap="innerHTML">
              Start voting
            </button>
          </main>
          <script src="/htmx.org@1.9.4.min.js"></script>
        </body>
      </html>
    ),
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  );

export const favicon = () => Response.file('public/images/favicon.ico');
export const htmx = () =>
  Response.file('public/js/htmx.org@1.9.4.min.js', {
    headers: {
      'content-type': 'application/javascript; charset=utf-8',
    },
  });

export default defineRoutes((app) => [app.get('/', home), app.get('/favicon.ico', favicon), app.get('/htmx.org@1.9.4.min.js', htmx)]);
