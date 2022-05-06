enum SocketChannels {
  SEND_AUDIO_CLIP = "SEND_AUDIO_CLIP",
  SEND_USER_STATUS_UPDATE = "SEND_USER_STATUS_UPDATE",

  SEND_STARTED_SPEAKING = "SEND_STARTED_SPEAKING",
  SEND_STOPPED_SPEAKING = "SEND_STOPPED_SPEAKING",

  JOIN_LIVE_ROOM = "JOIN_LIVE_ROOM",
  GET_ALL_ACTIVE_SOCKET_IDS = "GET_ALL_ACTIVE_SOCKET_IDS",

  SEND_SIGNAL = "SEND_SIGNAL",

  RECEIVE_SIGNAL = "RECEIVE_SIGNAL",

  // v3

  /**
   * when someone connects to a line, whether tuned in or not
   */
  CONNECT_TO_LINE = "CONNECT_TO_LINE",

  SOMEONE_CONNECTED_TO_LINE = "SOMEONE_CONNECTED_TO_LINE",
}

export default SocketChannels;

export class ConnectToLine {
  constructor(public lineId: string) {}
}
export class SomeoneConnected {
  constructor(public lineId: string, public userId: string) {}
}
