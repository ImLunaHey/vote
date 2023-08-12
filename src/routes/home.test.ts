import { Request } from '@nbit/bun';
import { expect, test } from 'bun:test';
import routes from './home';
import { createRequestHandler } from '../application';

const requestHandler = createRequestHandler(routes);

test('should return the home page', async () => {
    const request = new Request('http://localhost/');
    const response = await requestHandler(request);
    expect(await response.text()).toMatchSnapshot();
    expect(response.status).toBe(200);
});

test('should return the favicon', async () => {
    const request = new Request('http://localhost/favicon.ico');
    const response = await requestHandler(request);
    expect(response.status).toBe(200);
});
