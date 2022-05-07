import SocketChannels, {
  ConnectToLine,
  SomeoneConnected,
  SomeoneTuned,
  TuneToLine,
  UserBroadcastPull,
  UserBroadcastingPush,
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
      socket.on(SocketChannels.CONNECT_TO_LINE, (req: ConnectToLine) => {
        // add this user to the room
        console.log(`${socket.id} user joined room for line ${req.lineId}`);

        const roomName = `connectedLine:${req.lineId}`;
        socket.join(roomName);

        console.log(`${socket.id} now in rooms ${socket.rooms}`);

        const clientUserIdsInRoom = [...io.sockets.adapter.rooms.get(roomName)];

        io.in(roomName).emit(
          SocketChannels.SOMEONE_CONNECTED_TO_LINE,
          new SomeoneConnected(req.lineId, userInfo.userId, clientUserIdsInRoom)
        );
      });

      /** TUNE | User tunes into the line either temporarily or toggled in  */
      socket.on(SocketChannels.TUNE_TO_LINE, async (req: TuneToLine) => {
        console.log(`${socket.id} user tuned into room for line ${req.lineId}`);

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

        const clientUserIdsInRoom = io.sockets.adapter.rooms
          .get(roomName)
          .map((socketId: any) => socketIdsToUserIds[socketId]);

        // we want to notify everyone connected to the line even if they are not tuned in
        const connectedLine = `connectedLine:${req.lineId}`;

        io.in(connectedLine).emit(
          SocketChannels.SOMEONE_TUNED_TO_LINE,
          new SomeoneTuned(req.lineId, userInfo.userId, clientUserIdsInRoom)
        );
      });

      /** BROADCAST UPDATE | tell all who are connected to line, not just tuned into, that there is an update to someone broadcasting */
      socket.on(
        SocketChannels.USER_BROADCAST_PUSH_PULL,
        (req: UserBroadcastingPush) => {
          const roomName = `connectedLine:${req.lineId}`;

          io.in(roomName).emit(
            SocketChannels.USER_BROADCAST_PUSH_PULL,
            new UserBroadcastPull(req.lineId, userInfo.userId, req.isTurningOn)
          );
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
