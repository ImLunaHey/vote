import { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export const renderElement = (element: ReactElement) => renderToStaticMarkup(element);
export const renderPage = (element: ReactElement) => '<!DOCTYPE html>' + renderElement(element);
export const renderElementAsPage = (element: ReactElement) =>
  renderPage(
    <html>
      <head>
        <title>Vote!</title>
      </head>
      <body>
        <main>{element}</main>
      </body>
    </html>
  );
