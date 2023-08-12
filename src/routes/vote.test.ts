import { randomUUID } from 'crypto';
import { Request } from '@nbit/bun';
import { expect, mock, test } from 'bun:test';
import routes, { axiom } from './vote';
import { createRequestHandler } from '../application';
import { JSDOM } from 'jsdom';
import { QueryResult } from '@axiomhq/js';
import { thingsToVoteOn } from '../things-to-vote-on';

const requestHandler = createRequestHandler(routes);

const textToHtml = (html: string) => {
  const dom = new JSDOM(html);
  return dom.window.document;
};

test('should return a new session for the user', async () => {
  const request = new Request('http://localhost/vote');
  const response = await requestHandler(request);
  expect(response.status).toBe(200);

  const component = textToHtml(await response.text());
  const panels = component.querySelectorAll('.panel');
  const middle = component.querySelector('.middle');

  expect(panels.length).toBe(2);
  expect(middle?.textContent).toBe('or');
});

test('should return a set of things to vote on for an existing session', async () => {
  axiom.query = mock(async () => ({
    matches: [{
      data: {
        id: randomUUID(),
      }
    }],
  }) as unknown as QueryResult);

  const request = new Request(`http://localhost/vote/${randomUUID()}`);
  const response = await requestHandler(request);
  expect(response.status).toBe(200);

  const component = textToHtml(await response.text());
  const panels = component.querySelectorAll('.panel');
  const middle = component.querySelector('.middle');

  expect(panels.length).toBe(2);
  expect(middle?.textContent).toBe('or');
});


test('should return a 404 for non-existant vote IDs', async () => {
  const request = new Request(`http://localhost/vote/${randomUUID()}/${randomUUID()}`, { method: 'POST' });
  const response = await requestHandler(request);
  expect(response.status).toBe(404);

  expect(await response.text()).toContain('Nothing found for the provided ID');
});

test('should return the percentages after voting', async () => {
  const keys = [...thingsToVoteOn.keys()];
  const thingToVoteOnId = keys[0];
  const thingToVoteOn = thingsToVoteOn.get(thingToVoteOnId);
  axiom.query = mock(async (query) => query.endsWith(' | summarize count() by bin_auto(_time), choice') ? ({
    buckets: {
      totals: [{
        group: {
          choice: thingToVoteOn?.[0],
        },
        aggregations: [{
          value: 49,
        }]
      }, {
        group: {
          choice: thingToVoteOn?.[1],
        },
        aggregations: [{
          value: 51,
        }]
      }]
    }
  }) as unknown as QueryResult : ({
    matches: keys.map(id => ({ data: { id } })),
  }) as unknown as QueryResult);

  const request = new Request(`http://localhost/vote/${randomUUID()}/${thingToVoteOnId}`, { method: 'POST' });
  const response = await requestHandler(request);
  expect(response.status).toBe(200);

  const component = textToHtml(await response.text());
  const panels = component.querySelectorAll('.panel');
  const middle = component.querySelector('.middle');
  const h4s = component.querySelectorAll('h4');

  expect(panels.length).toBe(2);
  expect(middle?.textContent).toBe('next');
  expect(h4s[0].textContent).toBe('49%');
  expect(h4s[1].textContent).toBe('51%');
});

test('should return an error page is something goes wrong', async () => {
  const keys = [...thingsToVoteOn.keys()];
  const thingToVoteOnId = keys[0];

  axiom.flush = mock(async () => {
    throw new Error('Test Error!');
  });

  const request = new Request(`http://localhost/vote/${randomUUID()}/${thingToVoteOnId}`, { method: 'POST' });
  const response = await requestHandler(request);
  expect(response.status).toBe(500);

  const component = textToHtml(await response.text());
  const body = component.querySelector('body');

  expect(body?.textContent).toBe('Error: Something went wrong.');
});

test('should return the end screen when a session has voted on everything', async () => {
  thingsToVoteOn.clear();
  axiom.query = mock(async () => ({
    matches: [],
  }) as unknown as QueryResult);

  const request = new Request(`http://localhost/vote/${randomUUID()}`);
  const response = await requestHandler(request);
  expect(response.status).toBe(200);

  const component = textToHtml(await response.text());
  const panels = component.querySelectorAll('.panel');

  expect(panels.length).toBe(1);
  expect(panels[0].textContent).toBe('You already voted on everything, thanks for playing.');
});
