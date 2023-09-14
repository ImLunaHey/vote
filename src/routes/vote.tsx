import '@total-typescript/ts-reset';
import { randomUUID } from 'crypto';
import { defineRoutes } from '../application';
import { thingsToVoteOn } from '../things-to-vote-on';
import { HtmlPageResponse, HtmlResponse } from '../common/html-response';
import { VotingButtons } from '../components/voting-buttons';
import { Completed } from '../components/completed';
import { Result } from '../components/result';
import { Failure } from '../components/failure';
import { axiom } from '../common/axiom';
import { logger } from '../common/logger';
import { VoteService } from '../services/vote';
import { createChoicesComponent } from '../components/choices';

const generateNewVotingButtons = async (sessionId?: string) => {
  const voteService = new VoteService(sessionId);
  const nextThingToVoteOn = await voteService.getNextThingToVoteOn();
  if (!nextThingToVoteOn) return new HtmlResponse(<Completed />);
  const userSessionId = sessionId ?? (randomUUID() as string);
  const Choices = await createChoicesComponent(userSessionId);
  return new HtmlResponse(
    (
      <>
        <VotingButtons {...{ id: nextThingToVoteOn.id, sessionId: userSessionId, choices: nextThingToVoteOn.choices }} />
        <Choices />
      </>
    )
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

export const vote = async () => {
  const sessionId = randomUUID() as string;
  const Choices = await createChoicesComponent(sessionId);
  return new HtmlResponse(
    (
      <>
        <button className="panel" hx-get={`/vote/${sessionId}`} hx-trigger="click" hx-target="main" hx-swap="innerHTML">
          <h1>Start voting</h1>
        </button>
        <Choices />
      </>
    )
  );
};
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
    const Choices = await createChoicesComponent(sessionId);
    axiom.ingest('vote', [{ sessionId, id, choice }]);
    await axiom.flush();
    const percentages = await calculatePercentageOfVotes(id);
    return new HtmlResponse(
      (
        <>
          <Result {...{ id, sessionId, percentages }} />
          <Choices />
        </>
      )
    );
  } catch (error) {
    logger.error(error);
    return new HtmlPageResponse(<Failure message={error instanceof Error ? error.message : `${error}`} />, { status: 404 });
  }
};

export default defineRoutes((app) => [app.get('/vote', vote), app.get('/vote/:sessionId', voteWithSession), app.post('/vote/:sessionId/:voteId', voteWithId)]);
