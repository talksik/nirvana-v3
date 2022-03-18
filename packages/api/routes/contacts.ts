import express, { Application, Request, Response } from "express";

import { ObjectId } from "mongodb";
import Relationship from "@nirvana/core/models/relationship.model";
import { authCheck } from "../middleware/auth";
import { collections } from "../services/database.service";

export default function getContactsRoutes() {
  const router = express.Router();

  router.use(express.json());

  // see all of my contacts
  router.get("/", authCheck, getAllContacts);

  // send a friend request
  router.post("/:userId", authCheck, addContact);

  return router;
}

async function getAllContacts(req: Request, res: Response) {
  try {
    const { email } = res.locals;

    if (!email) {
      res.status(400).send("No email of user!");
      return;
    }

    // todo: fetch all of my contacts
  } catch (error) {
    console.log(error);
    res.status(500).send(`something went wrong`);
  }
}

async function addContact(req: Request, res: Response) {
  try {
    // get the userId of the person to add as a friend/contact
    const { userId } = req.params;

    if (!userId) {
      res.status(400).send("No contact id provided!");
      return;
    }

    // validations
    // make sure that we are not adding a friend that already has added us

    // add a many to many table of friends
    // const newRelationship = new Relationship();
  } catch (error) {
    console.log(error);
    res.status(500).send(`something went wrong`);
  }
}
