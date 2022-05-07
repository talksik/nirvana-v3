import {
  ConnectToLineRequest,
  ServerRequestChannels,
  ServerResponseChannels,
  SomeoneConnectedResponse,
  SomeoneTunedResponse,
  SomeoneUntunedFromLineResponse,
  StartBroadcastingRequest,
  StopBroadcastingRequest,
  TuneToLineRequest,
  UntuneFromLineRequest,
  UserStartedBroadcastingResponse,
  UserStoppedBroadcastingResponse,
} from "@nirvana/core/sockets/channels";

import GetAllSocketClients from "@nirvana/core/sockets/getAllActiveSocketClients";
import { JwtClaims } from "../middleware/auth";
import { LineMemberState } from "@nirvana/core/models/line.model";
import { LineService } from "../services/line.service";
import ReceiveSignal from "@nirvana/core/sockets/receiveSignal";
import SendSignal from "@nirvana/core/sockets/sendSignal";
import { UserService } from "../services/user.service";
import { UserStatus } from "@nirvana/core/models/user.model";
import { client } from "../services/database.service";
import { loadConfig } from "../config";

const jwt = require("jsonwebtoken");

const config = loadConfig();

// NOTE: client socket connections should never have to deal with socketIds
const socketIdsToUserIds: {
  [socketId: string]: string;
} = {};

export default function InitializeWs(io: any) {
  console.log("initializing web sockets");

  setInterval(() => {
    console.log(socketIdsToUserIds);
  }, 5000);

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

      socketIdsToUserIds[socket.id] = userInfo.userId.toString();

      console.log(
        `a user connected | user Id: ${userInfo.userId} and name: ${userInfo.name}`
      );

      socket.on("test", () => {
        console.log("asdf");
      });

      // ?verification that user is in a particular line to be tuned into it or just generally in it?

      /** CONNECT | User wants to subscribe to live emissions of a line */
      socket.on(
        ServerRequestChannels.CONNECT_TO_LINE,
        (req: ConnectToLineRequest) => {
          // add this user to the room
          console.log(`${socket.id} user joined room for line ${req.lineId}`);

          const roomName = `connectedLine:${req.lineId}`;
          socket.join(roomName);

          console.log(`${socket.id} now in rooms ${socket.rooms}`);

          const clientUserIdsInRoom = [
            ...io.sockets.adapter.rooms.get(roomName),
          ].map(
            (otherUserSocketId: string) => socketIdsToUserIds[otherUserSocketId]
          );

          io.in(roomName).emit(
            ServerResponseChannels.SOMEONE_CONNECTED_TO_LINE,
            new SomeoneConnectedResponse(
              req.lineId,
              userInfo.userId,
              clientUserIdsInRoom
            )
          );
        }
      );

      /** TUNE | User tunes into the line either temporarily or toggled in  */
      socket.on(
        ServerRequestChannels.TUNE_INTO_LINE,
        async (req: TuneToLineRequest) => {
          console.log(
            `${socket.id} user tuned into room for line ${req.lineId}`
          );

          const roomName = `tunedLine:${req.lineId}`;
          socket.join(roomName);

          console.log(`${socket.id} now in rooms ${socket.rooms}`);

          // persist tuning in if user is toggle tuning in
          if (req.keepTunedIn) {
            await LineService.updateLineMemberState(
              req.lineId,
              userInfo.userId,
              LineMemberState.TUNED
            );
          } else {
            // just updates the
            await LineService.updateLineMemberVisitDate(
              req.lineId,
              userInfo.userId
            );
          }

          const clientUserIdsInRoom = [
            ...io.sockets.adapter.rooms.get(roomName),
          ].map(
            (otherUserSocketId: string) => socketIdsToUserIds[otherUserSocketId]
          );

          // we want to notify everyone connected to the line even if they are not tuned in
          const connectedLineRoomName = `connectedLine:${req.lineId}`;

          io.in(connectedLineRoomName).emit(
            ServerResponseChannels.SOMEONE_TUNED_INTO_LINE,
            new SomeoneTunedResponse(
              req.lineId,
              userInfo.userId,
              clientUserIdsInRoom,
              req.keepTunedIn
            )
          );
        }
      );

      /**
       * TODO: handle when user wants to completely leave a line (delete or removed from one)
       */
      socket.on(ServerRequestChannels.DISCONNECT_FROM_LINE, () =>
        console.log("not implemented")
      );

      /**
       * Notify all connected users when someone UNTUNES from a room
       * ?might not be needed, all users' memory of tuned in users is irrelevant? don't need real time? but UI will show # of users tuned in?
       */
      socket.on(
        ServerRequestChannels.UNTUNE_FROM_LINE,
        async (req: UntuneFromLineRequest) => {
          const roomName = `tunedLine:${req.lineId}`;
          socket.leave(roomName);

          console.log("someone left room");

          const clientUserIdsInRoom = [
            ...io.sockets.adapter.rooms.get(roomName),
          ].map(
            (otherUserSocketId: string) => socketIdsToUserIds[otherUserSocketId]
          );

          // we want to notify everyone connected to the line even if they are not tuned in
          const connectedLineRoomName = `connectedLine:${req.lineId}`;

          io.in(connectedLineRoomName).emit(
            ServerResponseChannels.SOMEONE_UNTUNED_FROM_LINE,
            new SomeoneUntunedFromLineResponse(
              req.lineId,
              userInfo.userId,
              clientUserIdsInRoom
            )
          );
        }
      );

      // TODO: use same pattern as tuning and untuning and send updated fresh list of current broadcasters but using another namespace/room for broadcasters in a line
      /** BROADCAST UPDATE | tell all connected, not just tuned into, that there is an update to someone broadcasting */
      socket.on(
        ServerRequestChannels.BROADCAST_TO_LINE,
        (req: StartBroadcastingRequest) => {
          const roomName = `connectedLine:${req.lineId}`;

          io.in(roomName).emit(
            ServerResponseChannels.SOMEONE_STARTED_BROADCASTING,
            new UserStartedBroadcastingResponse(req.lineId, userInfo.userId)
          );
        }
      );

      socket.on(
        ServerRequestChannels.STOP_BROADCAST_TO_LINE,
        (req: StopBroadcastingRequest) => {
          const roomName = `connectedLine:${req.lineId}`;

          io.in(roomName).emit(
            ServerResponseChannels.SOMEONE_STOPPED_BROADCASTING,
            new UserStoppedBroadcastingResponse(req.lineId, userInfo.userId)
          );
        }
      );

      // socket.on(SocketChannels.SEND_SIGNAL, async (payload: SendSignal) => {
      //   console.log(payload);

      //   const sendingBackData: ReceiveSignal = {
      //     simplePeerSignal: payload.simplePeerSignal,
      //     senderUserSocketId: socket.id,
      //     isGoingBackToInitiator: payload.isAnswerer ? true : false,
      //   };

      //   io.to(payload.userSocketIdToSignal).emit(
      //     SocketChannels.RECEIVE_SIGNAL,
      //     sendingBackData
      //   );
      // });

      // ==== DISCONNECT ====
      socket.on("disconnect", () => {
        delete socketIdsToUserIds[socket.id];

        // get all of the rooms of this socket
        // notify everyone of this disconnection

        console.log("user disconnected");
        console.log(
          `list of sockets mappings in memory: ${socketIdsToUserIds}`
        );
      });
    });
}
