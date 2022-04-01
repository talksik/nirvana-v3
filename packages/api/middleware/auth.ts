import { NextFunction, Request, Response } from "express";

import { loadConfig } from "../config";

const config = loadConfig();

// used by specific routes that need to authentication
export const authCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;

    // verify jwt token
    const jwtSecret = config.JWT_TOKEN_SECRET;

    if (!authorization) {
      throw Error("No provided header");
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(401).send("unauthorized");
  }
};
