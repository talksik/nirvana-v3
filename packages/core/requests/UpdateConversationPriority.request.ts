import { MemberState } from '../models/conversation.model';

export default class UpdateConversationPriorityRequest {
  constructor(public newState: MemberState) {}
}
