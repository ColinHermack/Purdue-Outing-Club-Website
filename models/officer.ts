/**
 * A model of a row of the officer table of the database. For use when interacting with the
 * database.
 * 
 * @author Colin Hermack
 */

export default class Officer {
    member_id?: number;
    position?: string;
    year?: number;
    officerData?: object;
}