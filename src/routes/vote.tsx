import '@total-typescript/ts-reset';
import { randomUUID } from 'crypto';
import { Axiom } from '@axiomhq/js';
import { defineRoutes } from '../application';
import { thingsToVoteOn } from '../things-to-vote-on';
import { getRandomItemFromArray } from '../common/get-random-item-from-array';
import { HtmlPageResponse, HtmlResponse } from '../common/html-response';
import { VotingButtons } from '../components/voting-buttons';
import { Completed } from '../components/completed';
import { Result } from '../components/result';
import { Failure } from '../components/failure';

const noop = () => {};
const logger = process.env.NODE_ENV === 'test' ? ({ warn: noop, debug: noop, info: noop, error: noop } as typeof console) : console;

export const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN,
  orgId: process.env.AXIOM_ORG_ID,
});

const getThingsThisSessionHasVotedOn = (sessionId: string) =>
  axiom.query(`vote | where sessionId=="${sessionId}" | summarize count() by bin_auto(_time), id | project id`).then((_) => _.matches?.map((_) => _.data.id as string) ?? []);

const generateNewVotingButtons = async (sessionId?: string) => {
  const thingsThisSessionHasVotedOn = sessionId ? await getThingsThisSessionHasVotedOn(sessionId) : [];
  const thingsToVoteOnKeys = [...thingsToVoteOn.keys()].filter((key) => !thingsThisSessionHasVotedOn?.includes(key));
  const id = getRandomItemFromArray(thingsToVoteOnKeys);
  if (!id) return new HtmlResponse(<Completed />);
  const thingToVoteOn = thingsToVoteOn.get(id);
  if (!thingToVoteOn) return new HtmlResponse(<Completed />);
  const userSessionId = sessionId ?? (randomUUID() as string);
  return new HtmlResponse(<VotingButtons {...{ id, sessionId: userSessionId, thingToVoteOn }} />);
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

export const vote = () => generateNewVotingButtons();
export const voteWithSession = (request: { params: { sessionId: string } }) => generateNewVotingButtons(request.params.sessionId);
export const voteWithId = async (request: { params: { sessionId: string; voteId: string }; text: () => Promise<string> }) => {
  const id = request.params.voteId;
  if (!thingsToVoteOn.has(id)) return new HtmlPageResponse(<Failure message="Nothing found for the provided ID" />, { status: 404 });

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
    const percentages = await calculatePercentageOfVotes(id);
    return new HtmlResponse(<Result {...{ id, sessionId, percentages }} />);
  } catch (error) {
    logger.error(error);
    return new HtmlPageResponse(<Failure message={error instanceof Error ? error.message : `${error}`} />, { status: 404 });
  }
};

export default defineRoutes((app) => [app.get('/vote', vote), app.get('/vote/:sessionId', voteWithSession), app.post('/vote/:sessionId/:voteId', voteWithId)]);
