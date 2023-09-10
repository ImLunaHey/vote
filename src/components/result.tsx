import { randomUUID } from 'crypto';
import { thingsToVoteOn } from '../things-to-vote-on';

export const Result = ({ id = randomUUID() as string, sessionId, percentages }: { id: string; sessionId: string; percentages: (string | number)[][] }) => {
  const thingToVoteOn = thingsToVoteOn.get(id);
  if (!thingToVoteOn) throw new Error('Invalid ID');

  const leftTitle = thingToVoteOn[0];
  const leftPercentage = percentages.find((_) => `${_[0]}`.replaceAll('%20', ' ') === leftTitle)?.[1] ?? 0;
  const rightTitle = thingToVoteOn[1];
  const rightPercentage = percentages.find((_) => `${_[0]}`.replaceAll('%20', ' ') === rightTitle)?.[1] ?? 0;

  return (
    <>
      <div className="left panel">
        <h1>{leftTitle}</h1>
        <h4>{leftPercentage}%</h4>
      </div>
      <button className="middle" hx-get={`/vote/${sessionId}`} hx-trigger="click" hx-target="main" hx-swap="innerHTML">
        next
      </button>
      <div className="right panel">
        <h1>{rightTitle}</h1>
        <h4>{rightPercentage}%</h4>
      </div>
    </>
  );
};
