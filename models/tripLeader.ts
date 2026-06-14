/**
 * A model of a row of the trip leader table of the database. For use when interacting with the
 * database.
 * 
 * @author Colin Hermack
 */

class TripLeaderProcess {
    shadow?: boolean;
    approved?: boolean;
    certified?: boolean;
}

export default class TripLeader {
    memberId?: string;
    sport?: string;
    process?: TripLeaderProcess;
    leadCount?: number;
    gmail?: string;
}