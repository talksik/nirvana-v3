import User from '../models/user.model';

export default class UserDetailsResponse {
  constructor(public user: User) {}
}
