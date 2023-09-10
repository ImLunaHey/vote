import { randomUUID } from 'crypto';
import { thingsToVoteOn } from '../things-to-vote-on';

export const Result = ({ id = randomUUID() as string, sessionId, percentages }: { id: string; sessionId: string; percentages: (string | number)[][] }) => {
  const thingToVoteOn = thingsToVoteOn.get(id);
  if (!thingToVoteOn) throw new Error('Invalid ID');

  const firstTitle = thingToVoteOn[0];
  const firstPercentage = percentages.find((_) => `${_[0]}`.replaceAll('%20', ' ') === firstTitle)?.[1] ?? 0;
  const secondTitle = thingToVoteOn[1];
  const secondPercentage = percentages.find((_) => `${_[0]}`.replaceAll('%20', ' ') === secondTitle)?.[1] ?? 0;

  return (
    <>
      <div className="first panel">
        <h1>{firstTitle}</h1>
        <h4>{firstPercentage}%</h4>
      </div>
      <button className="middle" hx-get={`/vote/${sessionId}`} hx-trigger="click" hx-target="main" hx-swap="innerHTML">
        next
      </button>
      <div className="second panel">
        <h1>{secondTitle}</h1>
        <h4>{secondPercentage}%</h4>
      </div>
    </>
  );
};
