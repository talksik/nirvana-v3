import User from '../models/user.model';

export default class LoginResponse {
  constructor(public jwtToken: string, public userDetails: User) {}
}
