import React from 'react';
import { RouteWithParams } from 'xirelta';
import { logRequest, logger } from '../../../common/logger';
import { thingsToVoteOn } from '../../../things-to-vote-on';
import { HtmlPageResponse } from '../../../common/html-response';
import { axiom } from '../../../common/axiom';
import { createChoicesComponent } from '../../../components/choices';
import { Failure } from '../../../components/failure';
import { Result } from '../../../components/result';
import { z } from 'zod';

const schema = z.object({
    choice: z.string(),
});

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

const post: RouteWithParams<'POST', '/vote/:sessionId/:voteId'> = async request => {
    logRequest(request);
    const id = request.params.voteId;
    if (!thingsToVoteOn.has(id)) return new HtmlPageResponse(<Failure message="Nothing found for the provided ID" />, { status: 404 });

    try {
        const sessionId = request.params.sessionId;
        const body = schema.parse(request.body);
        const choice = body.choice;
        const Choices = await createChoicesComponent(sessionId);
        axiom.ingest('vote', [{ sessionId, id, choice }]);
        await axiom.flush();
        const percentages = await calculatePercentageOfVotes(id);
        return <>
            <Result {...{ id, sessionId, percentages }} />
            <Choices />
        </>;
    } catch (error) {
        console.error({
            message: 'INTERNAL_SERVER_ERROR',
            level: 'error',
            meta: {
                error,
            },
        });
        return new HtmlPageResponse(<Failure message={error instanceof Error ? error.message : `${error}`} />, { status: 404 });
    }
};

export default post;