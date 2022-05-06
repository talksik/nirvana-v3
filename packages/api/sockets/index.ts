import GetAllSocketClients from "@nirvana/core/sockets/getAllActiveSocketClients";
import { JwtClaims } from "../middleware/auth";
import ReceiveSignal from "@nirvana/core/sockets/receiveSignal";
import SendSignal from "@nirvana/core/sockets/sendSignal";
import SocketChannels from "@nirvana/core/sockets/channels";
import { UserService } from "../services/user.service";
import { UserStatus } from "@nirvana/core/models/user.model";
import { loadConfig } from "../config";

const jwt = require("jsonwebtoken");

const config = loadConfig();

export default function InitializeWs(io: any) {
  console.log("initializing web sockets");

  return io
    .use(function (socket: any, next: any) {
      console.log("authenticating user...");

      try {
        const { token } = socket.handshake.query;

        // verify jwt token with our api secret
        var decoded: JwtClaims = jwt.verify(token, config.JWT_TOKEN_SECRET);

        socket.userInfo = decoded;

        next();
      } catch (error) {
        console.error(error);
        next(new Error("WS Authentication Error"));
      }
    })
    .on("connection", function (socket: any) {
      const userInfo: JwtClaims = socket.userInfo;

      console.log(
        `a user connected | user Id: ${userInfo.userId} and name: ${userInfo.name}`
      );

      socket.on("test", () => {
        console.log("asdf");
      });

      // ?verification that user is in a particular line to be tuned into it or just generally in it?

      // regular socket rooms for information for all clients in a specific line

      // another namespace or so for clients tuned into certain lines

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
          console.log(
            `new audio chunks received..routing to appropriate room!`
          );
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
      socket.on(
        SocketChannels.SEND_STARTED_SPEAKING,
        (relationshipId: string) => {
          console.log(`started speaking in ${relationshipId}`);
          io.in(relationshipId).emit(
            SocketChannels.SEND_STARTED_SPEAKING,
            relationshipId
          );
        }
      );

      // tell everyone in a room when someone is stopping to speak
      socket.on(
        SocketChannels.SEND_STOPPED_SPEAKING,
        (relationshipId: string) => {
          console.log(`stopped speaking in ${relationshipId}`);
          io.in(relationshipId).emit(
            SocketChannels.SEND_STOPPED_SPEAKING,
            relationshipId
          );
        }
      );

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

      socket.on(SocketChannels.JOIN_LIVE_ROOM, async () => {
        // TODO: only get the socket ids of the relevant rooms for this user
        // return all Socket instances
        const allConnectedSockets = Array.from(await io.of("/").sockets.keys());

        io.to(socket.id).emit(SocketChannels.GET_ALL_ACTIVE_SOCKET_IDS, {
          socketIds: allConnectedSockets,
        } as GetAllSocketClients);
      });

      socket.on(SocketChannels.SEND_SIGNAL, async (payload: SendSignal) => {
        console.log(payload);

        const sendingBackData: ReceiveSignal = {
          simplePeerSignal: payload.simplePeerSignal,
          senderUserSocketId: socket.id,
          isGoingBackToInitiator: payload.isAnswerer ? true : false,
        };

        io.to(payload.userSocketIdToSignal).emit(
          SocketChannels.RECEIVE_SIGNAL,
          sendingBackData
        );
      });

      // ==== DISCONNECT ====
      socket.on("disconnect", () => {
        console.log("user disconnected");
      });
    });
}
