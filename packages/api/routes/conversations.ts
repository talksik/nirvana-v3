import Conversation, {
  ConversationMember,
  ConversationUserMember,
  MemberRole,
} from '@nirvana/core/models/conversation.model';
import { JwtClaims, authCheck } from '../middleware/auth';
import express, { NextFunction, Request, Response } from 'express';

import ConversationService from '../services/conversation.service';
import CreateConversationRequest from '@nirvana/core/requests/CreateConversationRequest.request';
import CreateConversationResponse from '@nirvana/core/responses/CreateConversationResponse.response';
import { MemberState } from '../../core/models/conversation.model';
import NirvanaResponse from '@nirvana/core/responses/nirvanaResponse';
import { UserService } from '../services/user.service';

export default function getConversationRoutes() {
  const router = express.Router();

  router.use(express.json());

  // get a conversation
  router.get('/:conversationId', authCheck);

  // get all conversations that I am in
  router.get('/', authCheck);

  // get a one on one conversation based on other user Id

  // get a conversation's content

  // create a conversation
  router.post('/', authCheck, createConversation);

  return router;
}

const createConversation = async (req: Request, res: Response, next: NextFunction) => {
  const createRequest = req.body as CreateConversationRequest;
  const userInfo = res.locals.userInfo as JwtClaims;

  console.log('other members', createRequest.otherMemberIds);

  if (!createRequest.otherMemberIds || createRequest.otherMemberIds.length === 0) {
    return next(new Error('must provide who you want to talk to'));
  }

  // process of creating other conversation user members with their user objects
  // for cached data purposes
  const otherUserMembers = await UserService.getUsersByIds(createRequest.otherMemberIds);
  if (!otherUserMembers) {
    return next(new Error('unable to find other conversation members'));
  }
  const conversationUserMembers: ConversationUserMember[] = [];

  createRequest.otherMemberIds.forEach(async (memberId) => {
    const userObject = otherUserMembers.find((userObj) => userObj._id?.equals(memberId));

    if (!userObject) {
      return next(new Error('unable to find a user that was passed in'));
    }

    const newConversationMember = new ConversationMember(MemberRole.regular, MemberState.inbox);

    conversationUserMembers.push({
      ...userObject,
      ...newConversationMember,
    });
  });

  // adding in the admin user which is the user who started the conversation
  const adminMember = new ConversationMember(MemberRole.admin, MemberState.inbox);
  const currentUser = await UserService.getUserById(userInfo.userId);
  if (!currentUser) {
    return next(new Error('unable to find your user object for caching'));
  }
  conversationUserMembers.push({
    ...currentUser,
    ...adminMember,
  });

  // make the insert of the overall conversation document
  const newConversation = new Conversation(
    userInfo.userId,
    conversationUserMembers,
    createRequest.conversationName,
  );
  const insertResult = await ConversationService.createConversation(newConversation);
  if (!insertResult) {
    return next(Error('unable to create a conversation'));
  }

  const responseObj = new NirvanaResponse<CreateConversationResponse>(
    new CreateConversationResponse(insertResult.insertedId),
    undefined,
    'created conversation!',
  );
  return res.json(responseObj);
};
