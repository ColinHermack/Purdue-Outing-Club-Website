/**
 * A data type object that will be passed to API endpoints and miniservices for updating trip leader records in the
 * database.
 *
 * @author Colin Hermack
 */

class UpdateTripLeaderProcessDTO {
  shadow?: boolean;
  approved?: boolean;
  certified?: boolean;
}

export default class UpdateTripLeaderDTO {
  memberId?: number;
  sport?: string[];
  process?: UpdateTripLeaderProcessDTO;
  gmail?: string;
}
