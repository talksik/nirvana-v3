import Conversation, {
  ConversationMember,
  ConversationUserMember,
  MemberRole,
} from '@nirvana/core/models/conversation.model';
import { JwtClaims, authCheck } from '../middleware/auth';
import express, { NextFunction, Request, Response, response } from 'express';

import ConversationService from '../services/conversation.service';
import CreateConversationRequest from '@nirvana/core/requests/CreateConversationRequest.request';
import CreateConversationResponse from '@nirvana/core/responses/CreateConversationResponse.response';
import { MemberState } from '../../core/models/conversation.model';
import NirvanaResponse from '@nirvana/core/responses/nirvanaResponse';
import { ObjectId } from 'mongodb';
import { UserService } from '../services/user.service';

export default function getConversationRoutes() {
  const router = express.Router();

  router.use(express.json());

  // get a conversation
  router.get('/:conversationId', authCheck);

  // get all conversations that I am in
  // todo: add in pagination for performance, while allowing getting long polling updates?
  router.get('/', authCheck, getAllConversations);

  // get a one on one conversation based on other user Id
  router.get('/check/:otherUserId', authCheck, getOneOnOneConversationIfExists);

  // get a conversation's content
  router.get('/:conversationId/content', authCheck);

  // create a conversation
  router.post('/', authCheck, createConversation);

  return router;
}

const getAllConversations = async (req: Request, res: Response, next: NextFunction) => {
  const userInfo = res.locals.userInfo as JwtClaims;

  // todo: use pagination params to get only certain ones

  try {
    const resultConversations = await ConversationService.getAllConversationsForUser(
      userInfo.userId,
    );

    const responseObj = new NirvanaResponse<Conversation[]>(
      resultConversations ?? [],
      undefined,
      'here are all of the conversations for user',
    );

    return res.json(responseObj);
  } catch (error) {
    return next(Error('unable to get conversations'));
  }
};

const getOneOnOneConversationIfExists = async (req: Request, res: Response, next: NextFunction) => {
  const userInfo = res.locals.userInfo as JwtClaims;
  const { otherUserId } = req.params;

  try {
    const resultConversation = await ConversationService.getConversationBetweenTwoPeople(
      new ObjectId(userInfo.userId),
      new ObjectId(otherUserId),
    );

    return res.json(
      new NirvanaResponse(
        resultConversation?._id ?? undefined,
        undefined,
        resultConversation
          ? 'there is a conversation...quick dial them now!'
          : 'no such conversation exists!',
      ),
    );
  } catch (error) {
    return next(Error('unable to get conversations'));
  }
};

const createConversation = async (req: Request, res: Response, next: NextFunction) => {
  const createRequest = req.body as CreateConversationRequest;
  const userInfo = res.locals.userInfo as JwtClaims;

  // todo: do quick check to make sure that we don't already have a conversation
  // as last resort if client didn't already do this

  if (!createRequest.otherUsers || createRequest.otherUsers.length === 0) {
    return next(new Error('must provide who you want to talk to'));
  }

  // if it's a one on one, and one already exists then don't allow creating another convo!!
  if (createRequest.otherUsers.length === 1) {
    const oneOnOneExists = await ConversationService.getConversationBetweenTwoPeople(
      new ObjectId(userInfo.userId),
      new ObjectId(createRequest.otherUsers[0]._id),
    );

    if (oneOnOneExists) {
      return next(Error('Already have a conversatoin with them! quick dial them!'));
    }
  }

  // process of creating other conversation user members with their user objects
  // for cached data purposes
  const conversationUserMembers: ConversationUserMember[] = [];

  createRequest.otherUsers.forEach((userObject) => {
    const newConversationMember = new ConversationMember(MemberRole.regular, MemberState.inbox);

    // ! hack as json over the wire converts to string for some reason
    userObject._id = new ObjectId(userObject._id);

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

  // todo: send updates to other users if they are connected through sockets

  const responseObj = new NirvanaResponse<CreateConversationResponse>(
    new CreateConversationResponse(insertResult.insertedId),
    undefined,
    'created conversation!',
  );
  return res.json(responseObj);
};
