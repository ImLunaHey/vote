import '@total-typescript/ts-reset';
import { randomUUID } from 'crypto';
import { Axiom } from '@axiomhq/js';
import { Response } from '@nbit/bun';
import { defineRoutes } from '../application';
import { thingsToVoteOn } from '../things-to-vote-on';

const noop = () => { };
const logger = process.env.NODE_ENV === 'test' ? { warn: noop, debug: noop, info: noop, error: noop } as typeof console : console;

export const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN,
  orgId: process.env.AXIOM_ORG_ID,
});

const getRandomItemFromArray = <T>(array: T[]): T | undefined => array[Math.floor(Math.random() * array.length)];

const generateCompletedResponse = () => new Response(`<div class="alert panel">You already voted on everything, thanks for playing.</div>`, { status: 200 });

const getThingsThisSessionHasVotedOn = (sessionId: string) => axiom
  .query(`vote | where sessionId=="${sessionId}" | summarize count() by bin_auto(_time), id | project id`)
  .then((_) => _.matches?.map((_) => _.data.id as string) ?? []);

const generateNewVotingButtons = async (sessionId?: string) => {
  const thingsThisSessionHasVotedOn = sessionId ? await getThingsThisSessionHasVotedOn(sessionId) : [];
  const thingsToVoteOnKeys = [...thingsToVoteOn.keys()].filter((key) => !thingsThisSessionHasVotedOn?.includes(key));
  const id = getRandomItemFromArray(thingsToVoteOnKeys);
  if (!id) return generateCompletedResponse();
  const thingToVoteOn = thingsToVoteOn.get(id);
  if (!thingToVoteOn) return generateCompletedResponse();
  const userSessionId = sessionId ?? randomUUID() as string;
  return new Response(
    `
    <button
      class="left panel"
      hx-post="/vote/${userSessionId}/${id}"
      hx-vals='{ "choice": "${thingToVoteOn[0]}" }'
      hx-trigger="click"
      hx-target="main"
      hx-swap="innerHTML"
    ><h1>${thingToVoteOn[0]}</h1></button>
    <button
      class="right panel"
      hx-post="/vote/${userSessionId}/${id}"
      hx-vals='{ "choice": "${thingToVoteOn[1]}" }'
      hx-trigger="click"
      hx-target="main"
      hx-swap="innerHTML"
    ><h1>${thingToVoteOn[1]}</h1></button>
    <div class="middle">or</div>
  `.trim(),
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  );
};

const calculatePercentageOfVotes = async (id: string) => {
  const query = `vote | where id=="${id}" | summarize count() by bin_auto(_time), choice`;
  const result = await axiom.query(query);
  const votes = Object.fromEntries(new Map(result.buckets.totals?.map((_) => [_.group['choice'], _.aggregations?.[0].value]))) as Record<string, number>;

  // Calculate the total number of votes
  const totalVotes = Object.values(votes).reduce((acc, curr) => acc + curr, 0);

  // Calculate the percentage of votes for each item
  const percentages = Object.values(votes).map((votes) => (votes / totalVotes) * 100);

  // Round the percentages to 2 decimal places for better readability
  const roundedPercentages = percentages.map((percentage) => parseFloat(percentage.toFixed(2)));

  return roundedPercentages.map((percentage, index) => [Object.keys(votes)[index], percentage]);
};

const generateResultResponse = async (sessionId = randomUUID() as string, id: string) => {
  const thingToVoteOn = thingsToVoteOn.get(id);
  if (!thingToVoteOn) throw new Error('Invalid ID');

  const percentages = await calculatePercentageOfVotes(id);
  const leftTitle = thingToVoteOn[0];
  const leftPercentage = percentages.find((_) => `${_[0]}`.replaceAll('%20', ' ') === leftTitle)?.[1] ?? 0;
  const rightTitle = thingToVoteOn[1];
  const rightPercentage = percentages.find((_) => `${_[0]}`.replaceAll('%20', ' ') === rightTitle)?.[1] ?? 0;

  return new Response(
    `
  <div class="left panel"><h1>${leftTitle}</h1><h4>${leftPercentage}%</h4></div>
  <div class="right panel"><h1>${rightTitle}</h1><h4>${rightPercentage}%</h4></div>
  <button
    class="middle"
    hx-get="/vote/${sessionId}"
    hx-trigger="click"
    hx-target="main"
    hx-swap="innerHTML"
  >next</button>
`,
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  );
};

const generateErrorResponse = ({
  status = 500,
  message = 'Something went wrong.',
} = {
    status: 500,
    message: 'Something went wrong.',
  }) => {
  return new Response(`<html><head></head><body><main><span>Error: ${message}</span></main></body></html>`, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
};

export const vote = () => generateNewVotingButtons();
export const voteWithSession = (request: { params: { sessionId: string } }) => generateNewVotingButtons(request.params.sessionId);
export const voteWithId = async (request: { params: { sessionId: string; voteId: string }; text: () => Promise<string> }) => {
  const id = request.params.voteId;
  if (!thingsToVoteOn.has(id)) return generateErrorResponse({ status: 404, message: 'Nothing found for the provided ID' });

  try {
    const sessionId = request.params.sessionId;
    const body = await request.text();
    const params = body
      .split(',')
      .map((_) => {
        const [a, b] = _.split('=');
        return {
          [a]: b,
        };
      })
      .reduce((previous, current) => ({ ...previous, ...current }), {});
    const choice = params.choice;
    axiom.ingest('vote', [{ sessionId, id, choice }]);
    await axiom.flush();
    return generateResultResponse(sessionId, id);
  } catch (error) {
    logger.error(error);
    return generateErrorResponse();
  }
};

export default defineRoutes((app) => [app.get('/vote', vote), app.get('/vote/:sessionId', voteWithSession), app.post('/vote/:sessionId/:voteId', voteWithId)]);
