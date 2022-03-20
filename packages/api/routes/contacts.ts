import Relationship, {
  RelationshipState,
} from "@nirvana/core/models/relationship.model";
import express, { Application, Request, Response } from "express";

import { ContactService } from "../services/contact.service";
import { ObjectId } from "mongodb";
import { authCheck } from "../middleware/auth";
import { collections } from "../services/database.service";

export default function getContactsRoutes() {
  const router = express.Router();

  router.use(express.json());

  // see all of my contacts
  router.get("/", authCheck, getAllContacts);

  // send a friend request
  router.post("/:otherUserGoogleId", authCheck, addContact);

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
    const { otherUserGoogleId } = req.params;
    const { userId } = res.locals;

    if (!otherUserGoogleId) {
      res.status(400).send("No contact id provided!");
      return;
    }

    if (otherUserGoogleId === userId) {
      res.status(400).send("Can't add yourself!");
      return;
    }

    // validations
    // make sure that we are not adding a friend that already has added us

    const newRelationship = new Relationship(
      userId,
      otherUserGoogleId,
      RelationshipState.PENDING
    );

    const insertResult = await ContactService.createRelationship(
      newRelationship
    );

    newRelationship._id = insertResult?.insertedId;

    insertResult
      ? res.status(200).send(newRelationship)
      : res.status(500).send("Failed to create account, already exists");

    return;
  } catch (error) {
    console.log(error);
    res.status(500).send(`something went wrong`);
  }
}
