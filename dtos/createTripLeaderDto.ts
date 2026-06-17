/**
 * A data type object that will be passed to API endpoints and miniservices when creating a new entry in the trip
 * leader table.
 * 
 * @author Colin Hermack
 */

class CreateTripLeaderProcessDTO {
    shadow?: boolean;
    approved?: boolean;
    certified?: boolean;
}

export default class CreateTripLeaderDTO {
    memberId?: number;
    sport?: string[];
    process?: CreateTripLeaderProcessDTO;
    gmail?: string;
}