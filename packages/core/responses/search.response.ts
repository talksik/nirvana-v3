import { User } from "@nirvana/core/models";

/**
 * Full results from the global search
 */
export default class SearchResponse {
  // all friends/contacts matching search
  contacts?: User[];

  // all public users
  constructor(public users: User[]) {}
}
