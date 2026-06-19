/**
 * A model of a row of the trip table of the database. For use when interacting with the
 * database.
 *
 * @author Colin Hermack
 */

export default class Trip {
  tripId?: number;
  name?: string;
  startDate?: Date;
  endDate?: Date;
  category?: string;
  sport?: string;
  location?: string;
  description?: string;
  logs?: object;
  signup?: boolean;
  difficulty?: number;
}
