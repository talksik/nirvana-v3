import {
  ConnectToLineRequest,
  RtcAnswerSomeoneRequest,
  RtcCallRequest,
  RtcNewUserJoinedResponse,
  RtcReceiveAnswerResponse,
  ServerRequestChannels,
  ServerResponseChannels,
  SomeoneConnectedResponse,
  SomeoneDisconnectedResponse,
  SomeoneTunedResponse,
  SomeoneUntunedFromLineResponse,
  StartBroadcastingRequest,
  StopBroadcastingRequest,
  TuneToLineRequest,
  UntuneFromLineRequest,
  UserStartedBroadcastingResponse,
  UserStoppedBroadcastingResponse,
} from '@nirvana/core/sockets/channels';

import { JwtClaims } from '../middleware/auth';
import environmentVariables from '../config/config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');

// NOTE: client socket connections should never have to deal with socketIds
const socketIdsToUserIds: {
  [socketId: string]: string;
} = {};
const userIdsToSocketIds: {
  [userId: string]: string;
} = {};

export default function InitializeWs(io: any) {
  console.log('initializing web sockets');

  return io
    .use(function (socket: any, next: any) {
      console.log('authenticating user...');

      try {
        const { token } = socket.handshake.query;
        console.log(token);

        // verify jwt token with our api secret
        const decoded: JwtClaims = jwt.verify(token, environmentVariables.JWT_TOKEN_SECRET);

        socket.userInfo = decoded;

        next();
      } catch (error) {
        console.error(error);
        next(new Error('WS Authentication Error'));
      }
    })
    .on('connection', function (socket: any) {
      const userInfo: JwtClaims = socket.userInfo;

      socketIdsToUserIds[socket.id] = userInfo.userId.toString();
      userIdsToSocketIds[userInfo.userId.toString()] = socket.id;

      console.log(`a user connected | user Id: ${userInfo.userId} and name: ${userInfo.name}`);

      socket.on('test', () => {
        console.log('asdf');
      });

      /** CONNECT | User wants to subscribe to live emissions of a line */
      socket.on(ServerRequestChannels.CONNECT_TO_LINE, (req: ConnectToLineRequest) => {
        // add this user to the room

        const connectedRoomName = `connectedLine:${req.lineId}`;
        const tunedRoomName = `tunedLine:${req.lineId}`;
        socket.join(connectedRoomName);

        console.log(`${socket.id} user CONNECTED room for line ${Object.keys(socket.rooms)}`);

        const clientUserIdsInConnectedRoom = [
          ...(io.sockets.adapter.rooms.get(connectedRoomName) ?? []),
        ].map((otherUserSocketId: string) => socketIdsToUserIds[otherUserSocketId]);

        const clientUserIdsInTunedRoom = [
          ...(io.sockets.adapter.rooms.get(tunedRoomName) ?? []),
        ].map((otherUserSocketId: string) => socketIdsToUserIds[otherUserSocketId]);

        io.in(connectedRoomName).emit(
          ServerResponseChannels.SOMEONE_CONNECTED_TO_LINE,
          new SomeoneConnectedResponse(
            req.lineId,
            userInfo.userId,
            clientUserIdsInConnectedRoom,
            clientUserIdsInTunedRoom,
          ),
        );
      });

      /** TUNE | User tunes into the line either temporarily or toggled in  */
      socket.on(ServerRequestChannels.TUNE_INTO_LINE, async (req: TuneToLineRequest) => {
        const roomName = `tunedLine:${req.lineId}`;
        socket.join(roomName);

        console.log(`${socket.id} user TUNED into room for line ${req.lineId}`);

        const clientUserIdsInRoom = [...(io.sockets.adapter.rooms.get(roomName) ?? [])].map(
          (otherUserSocketId: string) => socketIdsToUserIds[otherUserSocketId],
        );

        // we want to notify everyone connected to the line even if they are not tuned in
        const connectedLineRoomName = `connectedLine:${req.lineId}`;

        io.in(connectedLineRoomName).emit(
          ServerResponseChannels.SOMEONE_TUNED_INTO_LINE,
          new SomeoneTunedResponse(req.lineId, userInfo.userId, clientUserIdsInRoom),
        );
      });

      /**
       * Notify all connected users when someone UNTUNES from a room
       */
      socket.on(ServerRequestChannels.UNTUNE_FROM_LINE, async (req: UntuneFromLineRequest) => {
        const roomName = `tunedLine:${req.lineId}`;
        socket.leave(roomName);

        console.log(`${userInfo.userId} left room: ${roomName}`);

        // we want to notify everyone connected to the line even if they are not tuned in
        const connectedLineRoomName = `connectedLine:${req.lineId}`;

        io.in(connectedLineRoomName).emit(
          ServerResponseChannels.SOMEONE_UNTUNED_FROM_LINE,
          new SomeoneUntunedFromLineResponse(req.lineId, userInfo.userId),
        );
      });

      // ============== STREAMING ================
      socket.on(ServerRequestChannels.RTC_CALL_SOMEONE_FOR_LINE, (req: RtcCallRequest) => {
        console.log('slave calling a master');

        const userSocketId = userIdsToSocketIds[req.userToCall];

        io.to(userSocketId).emit(
          `${ServerResponseChannels.RTC_NEW_USER_JOINED}:${req.lineId}`,
          new RtcNewUserJoinedResponse(userInfo.userId, req.lineId, req.simplePeerSignal),
        );
      });

      socket.on(
        ServerRequestChannels.RTC_ANSWER_SOMEONE_FOR_LINE,
        (req: RtcAnswerSomeoneRequest) => {
          console.log('master answering slave');

          const userSocketId = userIdsToSocketIds[req.newbieUserId];

          io.to(userSocketId).emit(
            `${ServerResponseChannels.RTC_RECEIVING_MASTER_ANSWER}:${req.lineId}`,
            new RtcReceiveAnswerResponse(userInfo.userId, req.lineId, req.simplePeerSignal),
          );
        },
      );

      // tell everyone in the channel to
      // socket.on(ServerRequestChannels.CREATED_CHANNEL, (req: CreatedLineRequest) => {

      // })

      // tell all people in all my lines that I am disconnecting or untuning
      // tell the tuned in folks the new list of
      socket.on('disconnecting', (reason: any) => {
        console.log(`someone disconnecting: ${reason}`);

        console.log(socket.rooms);

        for (const roomName of socket.rooms) {
          if (roomName !== socket.id) {
            const lineId = roomName.split(':')[1];

            const roomToTell = roomName.includes('tunedLine')
              ? `connectedLine:${lineId}`
              : roomName;

            io.in(roomToTell).emit(
              ServerResponseChannels.SOMEONE_DISCONNECTED_FROM_LINE,
              new SomeoneDisconnectedResponse(lineId, userInfo.userId),
            );
          }
        }
      });

      // ==== DISCONNECT ====
      socket.on('disconnect', () => {
        delete socketIdsToUserIds[socket.id];
        delete userIdsToSocketIds[userInfo.userId];
      });
    });
}
