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

  router.post("/create", createUser);

  return router;
}

/**
 * Use token from middleware and get user properties
 * create user if doesn't exist
 */
async function getUserDetails(req: Request, res: Response) {
  const email: string = res.locals.email;

  // passed in accesstoken no matter what
  const { access_token } = req.query;

  console.log(`getting data for ${email}`);

  try {
    // return user details if it passed auth middleware
    const user = await UserService.getUserByEmail(email);

    // if no user found, then go ahead and create user
    if (!user) {
      if (!access_token) {
        res.status(400).send("No access token provided");
        return;
      }

      // get google user info from access token
      const userInfo: GoogleUserInfo =
        await UserService.getGoogleUserInfoWithAccessToken(
          access_token as string
        );

      // create initial user model object
      const newUser = new User(
        userInfo.email,
        userInfo.verifiedEmail,
        userInfo.name,
        userInfo.given_name,
        userInfo.family_name,
        userInfo.picture,
        userInfo.locale
      );

      // create user if not exists
      const insertResult = await UserService.createUserIfNotExists(newUser);
      newUser._id = insertResult?.insertedId;

      insertResult
        ? res.status(200).send(newUser)
        : res.status(500).send("Failed to create account, already exists");

      return;
    }

    // otherwise, just return the user details
    res.status(200).send(user);
  } catch (error) {
    res
      .status(404)
      .send(`unable to find a matching document with email: ${email}`);
  }
}

/** DEPRECATED...USING THE SAME SIGN IN ROUTE TO CREATE */
async function createUser(req: Request, res: Response) {
  try {
    const { access_token } = req.query;

    if (!access_token) {
      res.status(400).send("No access token provided");
      return;
    }

    // get google user info from access token
    const userInfo: GoogleUserInfo =
      await UserService.getGoogleUserInfoWithAccessToken(
        access_token as string
      );

    // create initial user model object
    const newUser = new User(
      userInfo.email,
      userInfo.verifiedEmail,
      userInfo.name,
      userInfo.given_name,
      userInfo.family_name,
      userInfo.picture,
      userInfo.locale
    );

    // create user if not exists
    const insertResult = await UserService.createUserIfNotExists(newUser);

    insertResult
      ? res.status(200).send("User created")
      : res.status(500).send("Failed to create account, already exists");
  } catch (error) {
    console.log(error);
    res.status(500).send("Problem in creating user");
  }
}
