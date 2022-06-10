import User from '../models/user.model';

/**
 * Full results from the global search
 */
export default class UserSearchResponse {
  // all public users
  constructor(public users: User[]) {}
}
