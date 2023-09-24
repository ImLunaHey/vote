import { expect, test } from 'bun:test';
import { renderElement, renderElementAsPage, renderPage } from 'src/common/render';
import React from 'react';

test('can render a JSX element to string', () => {
    expect(renderElement(<div>hello world</div>)).toBe('<div>hello world</div>');
});

test('adds doctype to rendered element', () => {
    expect(renderPage(<div>hello world</div>)).toBe('<!DOCTYPE html><div>hello world</div>');
});

test('renders element inside of template', () => {
    expect(renderElementAsPage(<div>hello world</div>)).toBe('<!DOCTYPE html><html><head><title>Vote!</title></head><body><main><div>hello world</div></main></body></html>');
});
