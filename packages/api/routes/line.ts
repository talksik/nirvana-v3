import { JwtClaims, authCheck } from "../middleware/auth";
import {
  Line,
  LineMember,
  LineMemberState,
} from "@nirvana/core/models/line.model";
import express, { Application, Request, Response } from "express";

import Content from "@nirvana/core/models/content.model";
import CreateLineRequest from "@nirvana/core/requests/createLine.request";
import GetConversationDetailsResponse from "@nirvana/core/responses/getConversationDetails.response";
import GetDmConversationByOtherUserIdResponse from "@nirvana/core/responses/getDmConversationByOtherUserId.response";
import GetUserLinesResponse from "@nirvana/core/responses/getUserLines.response";
import { LineService } from "../services/line.service";
import MasterLineData from "@nirvana/core/models/masterLineData.model";
import { ObjectId } from "mongodb";
import Relationship from "@nirvana/core/models/relationship.model";
import { UserService } from "../services/user.service";
import { collections } from "../services/database.service";

export default function getLineRoutes() {
  const router = express.Router();

  router.use(express.json());

  // get data for a one on one conversation
  // router.get("/:otherUserGoogleUserId", authCheck, getConversationDetails);

  // create a line
  router.post("/", authCheck, createLine);

  // get all of user's lines
  router.get("/", authCheck, getUserLines);

  // get conversation between user and other user
  router.get("/dm/:otherUserId", authCheck, getDmByOtherUserId);

  return router;
}

async function getDmByOtherUserId(req: Request, res: Response) {
  try {
    const { otherUserId } = req.params;
    const userInfo = res.locals.userInfo as JwtClaims;

    console.log(otherUserId);

    // check db for lines between me and this other person
    // if there is one, then return it with 200 status
    // else return it with custom status that frontend will read

    res.status(200).json();
    return;

    res.status(205).json("no such conversation between you two");
  } catch (error) {
    res.status(500).json(error);
  }
}

async function createLine(req: Request, res: Response) {
  try {
    const reqObj: CreateLineRequest = req.body as CreateLineRequest;
    console.log(req.body);

    if (!reqObj?.otherMemberIds.length) {
      res.status(400).json("must provide member Ids");
      return;
    }

    const userInfo = res.locals.userInfo as JwtClaims;

    const newLine = new Line(new ObjectId(), new Date());
    const lineMembers: LineMember[] =
      reqObj.otherMemberIds.map((memId) => {
        const newLineMember = new LineMember(
          newLine._id!,
          new ObjectId(memId),
          LineMemberState.INBOX
        );

        return newLineMember;
      }) ?? [];

    lineMembers.push(
      new LineMember(
        newLine._id!,
        new ObjectId(userInfo.userId),
        LineMemberState.INBOX
      )
    );

    const transactionResult = await LineService.createLine(
      newLine,
      lineMembers
    );

    transactionResult
      ? res.status(200).json(newLine)
      : res.status(400).json("unable to create line");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

async function getUserLines(req: Request, res: Response) {
  try {
    const userInfo = res.locals.userInfo as JwtClaims;

    // get all of user's lineMember entries
    const lineMembers = await LineService.getLineMembersByUserId(
      userInfo.userId
    );

    if (!lineMembers?.length) {
      res.status(400).json();

      return;
    }

    const lineIds = lineMembers?.map((lineMem) => lineMem.lineId) ?? [];

    // get all lines from the list of relevant lines
    const lines = (await LineService.getLinesByIds(lineIds)) ?? [];

    const masterLines =
      lines.map((currentLine) => {
        const associatedLineMember = lineMembers.find((lineMember) =>
          lineMember.lineId.equals(currentLine._id!)
        );

        // TODO: get all of the other members on the line

        // TODO: get the latest audio blocks for this line...maybe like today and yesterday or by block count

        return new MasterLineData(
          currentLine._id!,
          currentLine.createdDate,
          currentLine.lastUpdatedDate,
          associatedLineMember
        );
      }) ?? [];

    const resObj = new GetUserLinesResponse(lines);

    res.json(masterLines);
  } catch (error) {
    res.status(500).json(error);
  }
}
