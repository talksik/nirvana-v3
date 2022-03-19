import express, { Application, Request, Response } from "express";

import { ContactService } from "../services/contact.service";
import Content from "@nirvana/core/models/content.model";
import GetConversationDetailsResponse from "@nirvana/core/responses/getConversationDetails.response";
import { ObjectId } from "mongodb";
import Relationship from "@nirvana/core/models/relationship.model";
import { UserService } from "../services/user.service";
import { authCheck } from "../middleware/auth";
import { collections } from "../services/database.service";

export default function getConversationRoutes() {
  const router = express.Router();

  router.use(express.json());

  // get data for a one on one conversation
  router.get("/:otherUserGoogleUserId", authCheck, getConversationDetails);

  return router;
}

async function getConversationDetails(req: Request, res: Response) {
  try {
    // google user Id of current user
    const { userId } = res.locals;
    const { otherUserGoogleUserId } = req.params;

    // get the "other" user's details

    const otherUser = await UserService.getUserByGoogleId(
      otherUserGoogleUserId
    );

    if (!otherUser) {
      res.status(404).send("No such user found");
      return;
    }

    // find the relationship between us...if not there just null
    const ourRelationship = await ContactService.getRelationship(
      userId,
      otherUserGoogleUserId
    );

    // todo: get latest content based on limit count
    const latestContent: Content[] = [];

    const resObj = new GetConversationDetailsResponse(
      otherUser,
      false,
      ourRelationship ?? undefined,
      latestContent
    );

    res.status(200).send(resObj);
  } catch (error) {
    console.log(error);
    res.status(500).send(`something went wrong`);
  }
}
