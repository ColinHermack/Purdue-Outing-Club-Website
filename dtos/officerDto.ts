/**
 * A data type object for representing an officer in code.
 * 
 * @author Colin Hermack
 */

import MemberDTO from '@/dtos/memberDto';

export default class OfficerDTO {
    member?: MemberDTO;
    position?: string;
    year?: number;
    officer_data?: object;
}