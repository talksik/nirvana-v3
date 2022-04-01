import express, { Application, Request, Response } from "express";

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
  // router.get("/:otherUserGoogleUserId", authCheck, getConversationDetails);

  return router;
}
