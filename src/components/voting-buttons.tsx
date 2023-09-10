const VotingButton = ({ sessionId, id, thingToVoteOn, side }: { sessionId: string; id: string; thingToVoteOn: string; side: 'left' | 'right' }) => (
  <button
    className={`${side} panel`}
    hx-post={`/vote/${sessionId}/${id}`}
    hx-vals={JSON.stringify({ choice: thingToVoteOn })}
    hx-trigger="click"
    hx-target="main"
    hx-swap="innerHTML"
  >
    <h1>{thingToVoteOn}</h1>
  </button>
);

export const VotingButtons = ({ sessionId, id, thingToVoteOn }: { sessionId: string; id: string; thingToVoteOn: [string, string] }) => (
  <>
    <VotingButton {...{ sessionId, id, thingToVoteOn: thingToVoteOn[0], side: 'left' }} />
    <div className="middle">or</div>
    <VotingButton {...{ sessionId, id, thingToVoteOn: thingToVoteOn[1], side: 'right' }} />
  </>
);
