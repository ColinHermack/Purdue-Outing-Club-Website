/**
 * A data type object for representing a trip leader in code.
 * 
 * @author Colin Hermack
 */

import MemberDTO from '@/dtos/memberDto';

export default class TripLeaderDTO {
    member?: MemberDTO;
    sport?: string[];
    process?: object;
    leadCount?: number;
    gmail?: string;
}