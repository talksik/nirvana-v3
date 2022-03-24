import express, { Application, Request, Response } from "express";

import { NextFunction } from "express";
import SocketChannels from "@nirvana/core/sockets/channels";
import { UserService } from "./services/user.service";
import { UserStatus } from "@nirvana/core/models";
import { connectToDatabase } from "./services/database.service";
import cors from "cors";
import getContactsRoutes from "./routes/contacts";
import getConversationRoutes from "./routes/conversation";
import getSearchRoutes from "./routes/search";
import getUserRoutes from "./routes/user";
import http from "http";

const app = express();

app.use(cors());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log("Time: ", Date.now());
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.send("hello world.");
});

app.use("/api/users", getUserRoutes());
app.use("/api/search", getSearchRoutes());
app.use("/api/conversations", getConversationRoutes());
app.use("/api/contacts", getContactsRoutes());

const PORT = 5000;
var server = app.listen(PORT, () => console.log("express running"));
connectToDatabase();

// socket IO stuff

const io = require("socket.io")(server, {
  // todo: add protection
  cors: {
    origin: "*",
  },
});

io.on("connection", function (socket: any) {
  // add to map between between googleUserIds and socketId

  console.log("a user connected");

  // ===== JOIN ====
  /** User wants to subscribe to live emissions of a conversation */
  socket.on(SocketChannels.JOIN_ROOM, (relationshipId: string) => {
    // add this user to the room

    console.log(
      `${socket.id} user joined room for relationship ${relationshipId}`
    );

    socket.join(relationshipId);

    console.log(`${socket.id} now in rooms ${socket.rooms}`);
  });

  // ==== UPDATES ====
  // can be a change of:
  // 1. status...later...do short polling for this instead
  // 2. new content: audio clip or link
  // 3. someone is starting to speak
  // send message to everyone in room except sender...

  /** User wants to send some update to a particular room */
  socket.on(
    SocketChannels.SEND_AUDIO_CLIP,
    (relationshipId: string, audioChunks: any) => {
      console.log(`new audio chunks received..routing to appropriate room!`);
      console.log(relationshipId);
      console.log(audioChunks);

      io.in(relationshipId).emit(
        SocketChannels.SEND_AUDIO_CLIP,
        relationshipId,
        audioChunks
      );
    }
  );

  // tell everyone in a room when someone is starting to speak
  socket.on(SocketChannels.SEND_STARTED_SPEAKING, (relationshipId: string) => {
    console.log(`started speaking in ${relationshipId}`);
    io.in(relationshipId).emit(
      SocketChannels.SEND_STARTED_SPEAKING,
      relationshipId
    );
  });

  // tell everyone in a room when someone is stopping to speak
  socket.on(SocketChannels.SEND_STOPPED_SPEAKING, (relationshipId: string) => {
    console.log(`stopped speaking in ${relationshipId}`);
    io.in(relationshipId).emit(
      SocketChannels.SEND_STOPPED_SPEAKING,
      relationshipId
    );
  });

  // change of user status to all of users' rooms and db update
  socket.on(
    SocketChannels.SEND_USER_STATUS_UPDATE,
    async (userGoogleId: string, newStatus: UserStatus) => {
      console.log("new status for user");

      const resultUpdate = await UserService.updateUserStatus(
        userGoogleId,
        newStatus
      );

      // tell all rooms that the user is part of
      // that this user has updated their status
      if (resultUpdate?.modifiedCount) {
        socket.rooms.forEach((roomId: string) => {
          io.in(roomId).emit(
            SocketChannels.SEND_USER_STATUS_UPDATE,
            userGoogleId,
            newStatus
          );
        });
      }
    }
  );

  // ==== DISCONNECT ====
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
