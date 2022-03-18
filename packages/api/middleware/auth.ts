import { NextFunction, Request, Response } from "express";

import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(
  "423533244953-banligobgbof8hg89i6cr1l7u0p7c2pk.apps.googleusercontent.com"
);

// used by specific routes that need to authentication
export const authCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  try {
    const ticket = await client.verifyIdToken({
      idToken: authorization ?? "",
      audience:
        "423533244953-banligobgbof8hg89i6cr1l7u0p7c2pk.apps.googleusercontent.com", // Specify the CLIENT_ID of the app that accesses the backend
    });
    const userId = ticket.getPayload()?.sub;
    const email = ticket.getPayload()?.email;

    // used in subsequent handlers

    // todo: have to get our database id for the user instead of google's id
    res.locals.userId = userId;
    res.locals.email = email;

    next();
  } catch (error) {
    console.log(error);
    res.status(401).send("unauthorized");
  }
};
