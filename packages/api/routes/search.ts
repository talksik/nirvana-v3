import express, { Application, Request, Response } from "express";

import { User } from "@nirvana/core/models";
import UserSearchResponse from "../../core/responses/userSearch.response";
import { UserService } from "../services/user.service";
import { authCheck } from "../middleware/auth";

export default function getSearchRoutes() {
  const router = express.Router();

  router.use(express.json());

  // get user details based on id token
  router.get("/users", authCheck, handleUserSearch);

  return router;
}

async function handleUserSearch(req: Request, res: Response) {
  try {
    const { query } = req.query;

    if (!query) {
      res.status(400).send("No search query provided!");
      return;
    }

    // text search on users
    const users: User[] | null = await UserService.getUsersLikeEmailAndName(
      query as string
    );

    const resObj = new UserSearchResponse(users ?? []);

    res.send(resObj);
  } catch (error) {
    console.log(error);
    res.status(500).send(`something went wrong`);
  }
}
