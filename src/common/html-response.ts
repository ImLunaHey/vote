import { Response } from '@nbit/bun';
import { ReactElement } from 'react';
import { renderElement, renderElementAsPage } from './render';

export class HtmlResponse extends Response {
    constructor(element: ReactElement, init?: ResponseInit) {
        super(renderElement(element), init);
        this.headers.set('Content-Type', 'text/html; charset=utf-8');
    }
}

export class HtmlPageResponse extends Response {
    constructor(element: ReactElement, init?: ResponseInit) {
        super(renderElementAsPage(element), init);
        this.headers.set('Content-Type', 'text/html; charset=utf-8');
    }
}
