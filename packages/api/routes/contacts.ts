import GetContactsResponse, {
  ContactDetails,
} from "../../core/responses/getContacts.response";
import Relationship, {
  RelationshipState,
} from "@nirvana/core/models/relationship.model";
import express, { Application, Request, Response } from "express";

import { ContactService } from "../services/contact.service";
import { ObjectId } from "mongodb";
import UpdateRelationshipStateRequest from "../../core/requests/updateRelationshipState.request";
import { UserService } from "../services/user.service";
import { authCheck } from "../middleware/auth";
import { collections } from "../services/database.service";

export default function getContactsRoutes() {
  const router = express.Router();

  router.use(express.json());

  // see all of my contacts
  router.get("/", authCheck, getAllContacts);

  // send a friend request
  router.post("/:otherUserGoogleId", authCheck, addContact);

  router.put("/", authCheck, updateRelationshipState);

  return router;
}

// todo optimization with mongo lookups and such
async function getAllContacts(req: Request, res: Response) {
  try {
    const { userId } = res.locals;

    const resultRelationships = await ContactService.getAllUserRelationships(
      userId
    );

    const responseObj = new GetContactsResponse();

    // get all of the other users based on these relationships and join them
    await Promise.all(
      resultRelationships.map(async (relationship) => {
        const otherUserId =
          relationship.receiverUserId === userId
            ? relationship.senderUserId
            : relationship.receiverUserId;

        const otherUser = await UserService.getUserByGoogleId(otherUserId);

        if (otherUser)
          responseObj.contactsDetails.push(
            new ContactDetails(otherUser, relationship)
          );
      })
    );

    res.status(200).send(responseObj);
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
      : res.status(500).send("Failed to create relationship, already exists");

    return;
  } catch (error) {
    console.log(error);
    res.status(500).send(`something went wrong`);
  }
}

async function updateRelationshipState(req: Request, res: Response) {
  try {
    // get the userId of the person to add as a friend/contact
    const requestObj = req.body as UpdateRelationshipStateRequest;

    const updateResult = await ContactService.updateRelationshipState(
      requestObj.relationshipId,
      requestObj.newState
    );

    updateResult?.modifiedCount
      ? res.status(200).send("Updated state of relationship")
      : res.status(500).send("Failed to update relationship");

    return;
  } catch (error) {
    res.status(500).send(`something went wrong`);
  }
}
