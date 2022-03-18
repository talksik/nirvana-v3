import { GoogleUserInfo, User } from "@nirvana/core/models";
import express, { Application, Request, Response } from "express";

import { ObjectId } from "mongodb";
import { authCheck } from "../middleware/auth";
import { collections } from "../services/database.service";

export default function getUserRoutes() {
  const router = express.Router();

  router.use(express.json());

  // get user details based on id token
  router.get("/", authCheck, getUserDetails);

  //
  router.post("/", createUser);

  return router;
}

/**
 * Use token from middleware and get user properties
 * create user if doesn't exist
 */
async function getUserDetails(req: Request, res: Response) {
  const userId: string = res.locals.userId;

  try {
    const query = { _id: new ObjectId(userId) };

    // return user details if it passed auth middleware
    const user = (await collections.users?.findOne(query)) as unknown as User;

    res.status(200).send(user);
  } catch (error) {
    res
      .status(404)
      .send(`unable to find a matching document with id: ${userId}`);
  }
}

async function createUser(req: Request, res: Response) {
  try {
    const { access_token } = req.query;

    if (!access_token) {
      res.status(400);

      return;
    }
    // create user if not exists

    // get user info from access token
    const userInfo: GoogleUserInfo = await (
      await fetch(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`
      )
    ).json();

    res.send();
  } catch (error) {
    res.status(500);
  }
}
