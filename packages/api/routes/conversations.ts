import express, { NextFunction, Request, Response } from 'express';

import Conversation from '@nirvana/core/models/conversation.model';
import ConversationService from '../services/conversation.service';
import CreateConversationRequest from '@nirvana/core/requests/CreateConversationRequest.request';
import CreateConversationResponse from '@nirvana/core/responses/CreateConversationResponse.response';
import NirvanaResponse from '@nirvana/core/responses/nirvanaResponse';
import { authCheck } from '../middleware/auth';

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

  console.log(createRequest.conversation);

  if (!createRequest.conversation) {
    return next(new Error('must pass in a conversation'));
  }

  const insertResult = await ConversationService.createConversation(createRequest.conversation);

  if (!insertResult) {
    return next(Error('unale to create a conversation'));
  }

  const responseObj = new NirvanaResponse<CreateConversationResponse>(
    new CreateConversationResponse(insertResult.insertedId),
    undefined,
    'created conversation!',
  );

  return res.json(responseObj);
};
