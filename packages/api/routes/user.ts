import express, { Application, Request, Response } from "express";

import GoogleUserInfo from "@nirvana/core/models/googleUserInfo.model";
import { OAuth2Client } from "google-auth-library";
import { ObjectID } from "bson";
import { ObjectId } from "mongodb";
import { User } from "@nirvana/core/models/user.model";
import { UserService } from "../services/user.service";
import { UserStatus } from "../../core/models/user.model";
import { authCheck } from "../middleware/auth";

const client = new OAuth2Client(
  "423533244953-banligobgbof8hg89i6cr1l7u0p7c2pk.apps.googleusercontent.com"
);

export default function getUserRoutes() {
  const router = express.Router();

  router.use(express.json());

  // get user details based on id token
  // router.get("/", authCheck, getUserDetails);

  router.get("/login", login);

  router.get("/authCheck", authCheck);

  return router;
}

/** Create user if doesn't exist
 *  Returns jwt token for client and user details
 */
async function login(req: Request, res: Response) {
  // passed in accesstoken no matter what
  const { access_token, id_token } = req.query;

  try {
    const ticket = await client.verifyIdToken({
      idToken: (id_token as string) ?? "",
      audience:
        "423533244953-banligobgbof8hg89i6cr1l7u0p7c2pk.apps.googleusercontent.com", // Specify the CLIENT_ID of the app that accesses the backend
    });
    const googleUserId = ticket.getPayload()?.sub as string;
    const email = ticket.getPayload()?.email as string;

    if (!googleUserId || !email) {
      res.status(401).send("no google account found");
      return;
    }

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
        googleUserId,
        userInfo.email,
        userInfo.verifiedEmail,
        userInfo.name,
        userInfo.given_name,
        userInfo.family_name,
        userInfo.picture,
        userInfo.locale,
        new Date(),
        UserStatus.ONLINE,
        new Date()
      );

      // create user if not exists
      const insertResult = await UserService.createUserIfNotExists(newUser);

      // create jwt token with new user info

      insertResult
        ? res.status(200).send(newUser)
        : res.status(500).send("Failed to create account, already exists");

      return;
    }

    // create jwt token with existing user info

    res.status(200).send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send(`Problem with signing user up or logging in`);
  }
}
