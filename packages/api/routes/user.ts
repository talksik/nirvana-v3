import express, { Application, Request, Response } from "express";

import { authCheck } from "../middleware/auth";

export default function getUserRoutes() {
  const router = express.Router();

  // get user details based on id from token
  router.get("/", authCheck, getUserDetails);

  return router;
}

async function getUserDetails(req: Request, res: Response) {
  res.send({ message: "check" });
}
