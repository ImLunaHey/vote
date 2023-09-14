import { randomUUID } from 'crypto';
import { axiom } from '../common/axiom';
import { thingsToVoteOn } from '../things-to-vote-on';
import { getRandomItemFromArray } from '../common/get-random-item-from-array';

export class VoteService {
    public readonly sessionId: string;

    /**
     * true = sessionId was generated
     * false = sessionId was provided
     */
    private sessionIdProvided: boolean;

    constructor(sessionId?: string) {
        this.sessionId = sessionId ?? randomUUID();
        this.sessionIdProvided = !!sessionId;
    }

    async getThingsThisSessionHasVotedOn() {
        if (!this.sessionIdProvided) return [];

        const _ = await axiom.query(`vote | where sessionId=="${this.sessionId}" | summarize count() by bin_auto(_time), id | project id`);
        return _.matches?.map((_) => _.data.id as string).filter(Boolean) ?? [];
    }

    async getNextThingToVoteOn() {
        const thingsThisSessionHasVotedOn = await this.getThingsThisSessionHasVotedOn();
        const thingsToVoteOnKeys = [...thingsToVoteOn.keys()].filter((key) => !thingsThisSessionHasVotedOn?.includes(key));
        const id = getRandomItemFromArray(thingsToVoteOnKeys);
        if (!id) return null;
        const choices = thingsToVoteOn.get(id);
        if (!choices) return null;
        return {
            id,
            choices,
        };
    }
}
