import { JwtClaims, authCheck } from '../middleware/auth';
import User, { GoogleUserInfo, UserStatus } from '@nirvana/core/models/user.model';
import express, { NextFunction, Request, Response } from 'express';

import LoginResponse from '../../core/responses/login.response';
import { OAuth2Client } from 'google-auth-library';
import UserDetailsResponse from '../../core/responses/userDetails.response';
import { UserService } from '../services/user.service';
import environmentVariables from '../config/config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(environmentVariables.GOOGLE_AUTH_CLIENT_ID);

export default function getUserRoutes() {
  const router = express.Router();

  router.use(express.json());

  // get user details based on id token
  router.get('/', authCheck, getUserDetails);

  router.get('/login', login);

  // get user public information by id
  router.get('/:userId', authCheck, getPublicUser);

  router.get('/authcheck', authCheck, handleAuthCheck);

  return router;
}

async function handleAuthCheck(req: Request, res: Response) {
  res.status(200).json('You are good to go!');
}

async function getUserDetails(req: Request, res: Response, next: NextFunction) {
  const userInfo = res.locals.userInfo as JwtClaims;

  const user = await UserService.getUserById(userInfo.userId);

  if (user) {
    return res.status(200).json(new UserDetailsResponse(user));
  }

  res.status(404);
  next(Error('No user found'));
}

async function getPublicUser(req: Request, res: Response, next: NextFunction) {
  const { userId } = req.params;

  const user = await UserService.getUserById(userId as string);

  if (user) {
    return res.status(200).json(new UserDetailsResponse(user));
  }

  res.status(404);
  next(Error('No user found'));
}

/** Create user if doesn't exist
 *  Returns jwt token for client and user details
 */
async function login(req: Request, res: Response, next: NextFunction) {
  // passed in accesstoken no matter what
  const { access_token, id_token } = req.query;

  const ticket = await client.verifyIdToken({
    idToken: (id_token as string) ?? '',
    audience: environmentVariables.GOOGLE_AUTH_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
  });
  const googleUserId = ticket.getPayload()?.sub as string;
  const email = ticket.getPayload()?.email as string;

  if (!googleUserId || !email) {
    res.status(401);
    return next(Error('no google account found'));
  }

  // return user details if it passed auth middleware
  const user = await UserService.getUserByEmail(email);

  // if no user found, then go ahead and create user
  if (!user) {
    if (!access_token) {
      res.status(401);
      return next(Error('No access token provided'));
    }

    // get google user info from access token
    const userInfo: GoogleUserInfo = await UserService.getGoogleUserInfoWithAccessToken(
      access_token as string,
    );

    // create initial user model object

    const newUser = new User(
      googleUserId,
      userInfo.email,
      userInfo.name,
      userInfo.given_name,
      userInfo.family_name,
      new Date(),
      userInfo.picture,
      userInfo.verifiedEmail,
      userInfo.locale,
    );

    // create user if not exists
    const insertResult = await UserService.createUserIfNotExists(newUser);

    newUser._id = insertResult?.insertedId;

    // create jwt token with new user info
    const jwtToken = jwt.sign(
      {
        userId: newUser._id,
        googleUserId: newUser.googleId,
        picture: newUser.picture,
        email: newUser.email,
        name: newUser.name,
      },
      environmentVariables.JWT_TOKEN_SECRET,
    );

    if (insertResult) {
      return res.status(200).json(new LoginResponse(jwtToken, newUser));
    }

    return next(Error('Failed to create account, already exists'));
  }

  // create jwt token with existing user info
  const existingUserJwtToken = jwt.sign(
    {
      userId: user._id,
      googleUserId: user.googleId,
      picture: user.picture,
      email: user.email,
      name: user.name,
    },
    environmentVariables.JWT_TOKEN_SECRET,
  );

  return res.status(200).json(new LoginResponse(existingUserJwtToken, user));
}
