/**
 * A data type object for representing a trip in code.
 *
 * @author Colin Hermack
 */

export default class TripDTO {
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
