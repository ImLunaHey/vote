const VotingButton = ({ sessionId, id, thingToVoteOn, position }: { sessionId: string; id: string; thingToVoteOn: string; position: 'first' | 'second' }) => (
  <button
    className={`${position} panel`}
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
    <VotingButton {...{ sessionId, id, thingToVoteOn: thingToVoteOn[0], position: 'first' }} />
    <div className="middle">or</div>
    <VotingButton {...{ sessionId, id, thingToVoteOn: thingToVoteOn[1], position: 'second' }} />
  </>
);
