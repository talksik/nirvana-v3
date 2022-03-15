import express, { Application, Request, Response } from "express";

export default function getUserRoutes() {
  const router = express.Router();

  // get user details based on id from token
  router.get("/", getUserDetails);

  return router;
}

async function getUserDetails(req: Request, res: Response) {
  console.log(req);

  res.send({ message: "check" });
}
