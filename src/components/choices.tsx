import { VoteService } from '../services/vote';
import { thingsToVoteOnCount } from '../things-to-vote-on';

export const createChoicesComponent = async (sessionId: string) => {
  const voteService = new VoteService(sessionId);
  const count = (await voteService.getThingsThisSessionHasVotedOn()).length;
  return () => <span className="choices">{`${thingsToVoteOnCount - count} choices`}</span>;
};
