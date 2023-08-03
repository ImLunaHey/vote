import { randomUUID } from "crypto";
import { Axiom } from "@axiomhq/js";
import { Response } from "@nbit/bun";
import { defineRoutes } from "../application";
import { thingsToVoteOn } from "../things-to-vote-on";

const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN,
  orgId: process.env.AXIOM_ORG_ID,
});

const getRandomItemFromArray = (array: unknown[]) =>
  array[Math.floor(Math.random() * array.length)];

const generateCompletedResponse = () =>
  new Response(
    `<div class="alert panel">You already voted on everything, thanks for playing.</div>`,
    { status: 200 }
  );

const generateNewVotingButtons = async (sessionId = randomUUID()) => {
  const thingsThisSessionHasVotedOn = await axiom
    .query(
      `vote | where sessionId=="${sessionId}" | summarize count() by bin_auto(_time), id | project id`
    )
    .then((_) => _.matches?.map((_) => _.data.id));
  const thingsToVoteOnKeys = [...thingsToVoteOn.keys()].filter(
    (key) => !thingsThisSessionHasVotedOn?.includes(key)
  );
  const id = getRandomItemFromArray(thingsToVoteOnKeys) as string | undefined;
  if (!id) return generateCompletedResponse();
  const thingToVoteOn = thingsToVoteOn.get(id);
  if (!thingToVoteOn) return generateCompletedResponse();

  return new Response(
    `
    <button
      class="left panel"
      hx-post="/vote/${sessionId}/${id}/${thingToVoteOn[0]}"
      hx-trigger="click"
      hx-target="main"
      hx-swap="innerHTML"
    ><h1>${thingToVoteOn[0]}</h1></button>
    <button
      class="right panel"
      hx-post="/vote/${sessionId}/${id}/${thingToVoteOn[1]}"
      hx-trigger="click"
      hx-target="main"
      hx-swap="innerHTML"
    ><h1>${thingToVoteOn[1]}</h1></button>
    <div class="middle">or</div>
  `,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    }
  );
};

const calculatePercentageOfVotes = async (id: string) => {
  const query = `vote | where id=="${id}" | summarize count() by bin_auto(_time), choice`;
  const votes = (await axiom
    .query(query)
    .then((_) =>
      Object.fromEntries(
        new Map(
          _.buckets.totals?.map((_) => [
            _.group["choice"],
            _.aggregations?.[0].value,
          ])
        )
      )
    )) as Record<string, number>;

  // Calculate the total number of votes
  const totalVotes = Object.values(votes).reduce((acc, curr) => acc + curr, 0);

  // Calculate the percentage of votes for each item
  const percentages = Object.values(votes).map(
    (votes) => (votes / totalVotes) * 100
  );

  // Round the percentages to 2 decimal places for better readability
  const roundedPercentages = percentages.map((percentage) =>
    parseFloat(percentage.toFixed(2))
  );

  return roundedPercentages.map((percentage, index) => [
    Object.keys(votes)[index],
    percentage,
  ]);
};

const generateResultResponse = async (sessionId = randomUUID(), id: string) => {
  const thingToVoteOn = thingsToVoteOn.get(id);
  if (!thingToVoteOn) throw new Error("Invalid ID");
  const percentages = await calculatePercentageOfVotes(id);
  const leftTitle = thingToVoteOn[0];
  const leftPercentage = percentages.find((_) => _[0] === leftTitle)?.[1] ?? 0;
  const rightTitle = thingToVoteOn[1];
  const rightPercentage =
    percentages.find((_) => _[0] === rightTitle)?.[1] ?? 0;
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
        "Content-Type": "text/html; charset=utf-8",
      },
    }
  );
};

const generateErrorResponse = () =>
  new Response(`<main><span>Error: Something went wrong.</span></main>`, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });

export default defineRoutes((app) => [
  app.get("/vote", () => generateNewVotingButtons()),
  app.get("/vote/:sessionId", (request) =>
    generateNewVotingButtons(request.params.sessionId)
  ),
  app.post("/vote/:sessionId/:voteId/:choice", async (request) => {
    try {
      const sessionId = request.params.sessionId;
      const id = request.params.voteId;
      const choice = request.params.choice;
      axiom.ingest("vote", [{ sessionId, id, choice }]);
      await axiom.flush();
      return generateResultResponse(sessionId, id);
    } catch (error) {
      console.error(error);
      return generateErrorResponse();
    }
  }),
]);
