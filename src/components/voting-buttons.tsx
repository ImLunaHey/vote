const VotingButton = ({
  sessionId,
  id,
  choice,
  position,
}: {
  sessionId: string;
  id: string;
  choice: string;
  position: 'first' | 'second';
}) => (
  <button
    className={`${position} panel`}
    hx-post={`/vote/${sessionId}/${id}`}
    hx-vals={JSON.stringify({ choice })}
    hx-trigger="click"
    hx-target="main"
    hx-swap="innerHTML"
    data-umami-event="vote"
    data-umami-event-choice={choice}
  >
    <h1>{choice}</h1>
  </button>
);

export const VotingButtons = ({ sessionId, id, choices }: { sessionId: string; id: string; choices: [string, string] }) => (
  <>
    <VotingButton {...{ sessionId, id, choice: choices[0], position: 'first' }} />
    <div className="middle">or</div>
    <VotingButton {...{ sessionId, id, choice: choices[1], position: 'second' }} />
  </>
);
