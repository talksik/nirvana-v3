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
  console.log(req.headers);

  // todo get idToken from frontend
  const ticket = await client.verifyIdToken({
    idToken: "",
    audience:
      "423533244953-banligobgbof8hg89i6cr1l7u0p7c2pk.apps.googleusercontent.com", // Specify the CLIENT_ID of the app that accesses the backend
  });
  const userid = ticket.getPayload()?.sub;

  console.log(userid);

  next();
};
