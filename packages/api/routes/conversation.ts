import {
  Conversation,
  ConversationMember,
  ConversationMemberState,
} from "../../core/models/conversation.model";
import { JwtClaims, authCheck } from "../middleware/auth";
import express, { Application, Request, Response } from "express";

import Content from "@nirvana/core/models/content.model";
import { ConversationService } from "../services/conversation.service";
import CreateConvoRequest from "../../core/requests/createConvo.request";
import GetConversationDetailsResponse from "@nirvana/core/responses/getConversationDetails.response";
import GetDmConversationByOtherUserIdResponse from "../../core/responses/getDmConversationByOtherUserId.response";
import MasterConversation from "../../core/models/masterConversation.model";
import { ObjectId } from "mongodb";
import Relationship from "@nirvana/core/models/relationship.model";
import { UserService } from "../services/user.service";
import { collections } from "../services/database.service";

export default function getConversationRoutes() {
  const router = express.Router();

  router.use(express.json());

  // get data for a one on one conversation
  // router.get("/:otherUserGoogleUserId", authCheck, getConversationDetails);

  // create a convo
  router.post("/", authCheck, createConversation);

  // get conversation between user and other user
  router.get("/dm/:otherUserId", authCheck, getDmByOtherUserId);

  return router;
}

async function getDmByOtherUserId(req: Request, res: Response) {
  try {
    const { otherUserId } = req.params;
    const userInfo = res.locals.userInfo as JwtClaims;

    console.log(otherUserId);

    // check db for convos between me and this other person
    // if there is one, then return it with 200 status
    // else return it with custom status that frontend will read

    res.status(200).json();
    return;

    res.status(205).json("no such conversation between you two");
  } catch (error) {
    res.status(500).json(error);
  }
}

async function createConversation(req: Request, res: Response) {
  try {
    const reqObj: CreateConvoRequest = req.body as CreateConvoRequest;

    if (!reqObj?.otherMemberIds.length) {
      res.status(400).json("must provide member Ids");
      return;
    }

    const userInfo = res.locals.userInfo as JwtClaims;

    const newConvo = new Conversation();
    const convoMembers: ConversationMember[] =
      reqObj.otherMemberIds.map((memId) => {
        const newConvoMember = new ConversationMember(
          newConvo._id,
          new ObjectId(memId),
          ConversationMemberState.INVITED
        );

        return newConvoMember;
      }) ?? [];

    convoMembers.push(
      new ConversationMember(
        newConvo._id,
        new ObjectId(userInfo.userId),
        ConversationMemberState.INBOX
      )
    );

    const transactionResult = await ConversationService.createConversation(
      newConvo,
      convoMembers
    );

    transactionResult
      ? res.status(200).json(newConvo)
      : res.status(400).json("unable to create convo");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
