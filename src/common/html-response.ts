import { ReactElement } from 'react';
import { renderElementAsPage } from './render';

export class HtmlPageResponse extends Response {
    constructor(element: ReactElement, init?: ResponseInit) {
        super(renderElementAsPage(element), init);
        this.headers.set('Content-Type', 'text/html; charset=utf-8');
    }
}
