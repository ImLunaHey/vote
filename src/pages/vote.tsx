import '@total-typescript/ts-reset';
import { randomUUID } from 'crypto';
import { logRequest } from '../common/logger';
import { createChoicesComponent } from '../components/choices';
import React from 'react';
import { RouteWithParams } from 'xirelta';

const route: RouteWithParams<'*', '/vote'> = async (request) => {
  logRequest(request);
  const sessionId = randomUUID() as string;
  const Choices = await createChoicesComponent(sessionId);
  return <>
    <button className="panel" hx-get={`/vote/${sessionId}`} hx-trigger="click" hx-target="main" hx-swap="innerHTML">
      <h1>Start voting</h1>
    </button>
    <Choices />
  </>;
};

export default route;
