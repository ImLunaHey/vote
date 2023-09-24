import React from 'react';
import { randomUUID } from 'crypto';
import { RouteWithParams } from 'xirelta';
import { Completed } from '../../components/completed';
import { createChoicesComponent } from '../../components/choices';
import { logRequest } from '../../common/logger';
import { VoteService } from '../../services/vote';
import { VotingButtons } from '../../components/voting-buttons';

const generateNewVotingButtons = async (sessionId?: string) => {
    const voteService = new VoteService(sessionId);
    const nextThingToVoteOn = await voteService.getNextThingToVoteOn();
    if (!nextThingToVoteOn) return <Completed />;
    const userSessionId = sessionId ?? (randomUUID() as string);
    const Choices = await createChoicesComponent(userSessionId);
    return <>
        <VotingButtons {...{ id: nextThingToVoteOn.id, sessionId: userSessionId, choices: nextThingToVoteOn.choices }} />
        <Choices />
    </>;
};

export const get: RouteWithParams<'GET', '/vote/:sessionId'> = request => {
    logRequest(request);
    return generateNewVotingButtons(request.params.sessionId);
};
