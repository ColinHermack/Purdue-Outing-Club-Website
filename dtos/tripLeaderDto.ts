/**
 * A data type object for representing a trip leader in code.
 * 
 * @author Colin Hermack
 */

import MemberDTO from '@/dtos/memberDto';

class TripLeaderProcessDTO {
    shadow?: boolean;
    approved?: boolean;
    certified?: boolean;
}

export default class TripLeaderDTO {
    member?: MemberDTO;
    sport?: string[];
    process?: TripLeaderProcessDTO;
    leadCount?: number;
    gmail?: string;
}