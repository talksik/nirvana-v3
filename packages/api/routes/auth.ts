import express, { Application, Request, Response } from "express";

export default function getAuthRoutes() {
  const router = express.Router();

  router.get("/", check);

  return router;
}

async function check(req: Request, res: Response) {
  console.log(req);

  res.send({ message: "check" });
}
