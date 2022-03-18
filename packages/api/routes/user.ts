import { GoogleUserInfo, User } from "@nirvana/core/models";
import express, { Application, Request, Response } from "express";

import { ObjectId } from "mongodb";
import { UserService } from "../services/user.service";
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

  console.log(`getting data for ${userId}`);

  try {
    // return user details if it passed auth middleware
    const user = await UserService.getUserById(userId);

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

    // get google user info from access token
    const userInfo: GoogleUserInfo =
      await UserService.getGoogleUserInfoWithAccessToken(
        access_token as string
      );

    console.log(userInfo);

    // create initial user model object
    const newUser = new User(
      new ObjectId(userInfo.id),
      userInfo.email,
      userInfo.verifiedEmail,
      userInfo.name,
      userInfo.given_name,
      userInfo.family_name,
      userInfo.picture,
      userInfo.locale
    );

    console.log(newUser);

    // create user if not exists
    const insertResult = await UserService.createUserIfNotExists(newUser);

    insertResult
      ? res.status(200).send("User created")
      : res.status(500).send("Failed to create new user");
  } catch (error) {
    res.status(500);
  }
}
