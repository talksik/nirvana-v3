export class UserInfo {
  constructor(
    public id: string,
    public email: string,
    public verifiedEmail: boolean,
    public name: string,
    public given_name: string,
    public family_name: string,
    public picture: string,
    public locale: string
  ) {}
}
