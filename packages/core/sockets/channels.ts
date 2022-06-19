// ! MAKE SURE THAT THE ENUMS BETWEEN REQUEST AND RESPONSE DON'T OVERLAP???
// ?maybe won't matter since it's different for server and client?
export enum ServerRequestChannels {
  CONNECT_TO_LINE = 'CONNECT_TO_LINE',

  DISCONNECT_FROM_LINE = 'DISCONNECT_FROM_LINE', // TODO: not implementing now

  TUNE_INTO_LINE = 'TUNE_INTO_LINE', // pass in if user wants to toggle/persist? or is this just temporary?
  UNTUNE_FROM_LINE = 'UNTUNE_FROM_LINE',

  RTC_CALL_SOMEONE_FOR_LINE = 'RTC_CALL_SOMEONE_FOR_LINE',
  RTC_ANSWER_SOMEONE_FOR_LINE = 'RTC_ANSWER_SOMEONE_FOR_LINE',

  GOING_INTO_FLOW_STATE = 'GOING_INTO_FLOW_STATE',
}

export enum ServerResponseChannels {
  SOMEONE_CONNECTED_TO_LINE = 'SOMEONE_CONNECTED_TO_LINE',
  SOMEONE_DISCONNECTED_FROM_LINE = 'SOMEONE_DISCONNECTED_FROM_LINE',

  SOMEONE_TUNED_INTO_LINE = 'SOMEONE_TUNED_INTO_LINE', // allows all current tuned in folks to create peer objects
  SOMEONE_UNTUNED_FROM_LINE = 'SOMEONE_UNTUNED_FROM_LINE', // discard peer

  RTC_NEW_USER_JOINED = 'RTC_NEW_USER_JOINED',
  RTC_RECEIVING_MASTER_ANSWER = 'RTC_RECEIVING_MASTER_ANSWER',

  SOMEONE_GOING_INTO_FLOW_STATE = 'SOMEONE_GOING_INTO_FLOW_STATE',
}

export class ConnectToLineRequest {
  constructor(public lineId: string) {}
}
export class SomeoneConnectedResponse {
  constructor(
    public lineId: string,
    public userId: string,
    public allConnectedUsers: string[],
    public allTunedUsers: string[],
  ) {}
}

export class SomeoneDisconnectedResponse {
  constructor(public lineId: string, public userId: string) {}
}
export class TuneToLineRequest {
  constructor(public lineId: string) {}
}
export class SomeoneTunedResponse {
  constructor(public lineId: string, public userId: string, public allUsers: string[]) {}
}
export class UntuneFromLineRequest {
  constructor(public lineId: string) {}
}
export class SomeoneUntunedFromLineResponse {
  constructor(public lineId: string, public userId: string) {}
}

export class StartBroadcastingRequest {
  constructor(public lineId: string) {}
}
export class UserStartedBroadcastingResponse {
  constructor(public lineId: string, public userId: string) {}
}

export class StopBroadcastingRequest {
  constructor(public lineId: string) {}
}
export class UserStoppedBroadcastingResponse {
  constructor(public lineId: string, public userId: string) {}
}

export class RtcCallRequest {
  constructor(public userToCall: string, public lineId: string, public simplePeerSignal: any) {}
}

export class RtcNewUserJoinedResponse {
  constructor(public userWhoCalled: string, public lineId: string, public simplePeerSignal: any) {}
}

export class RtcAnswerSomeoneRequest {
  constructor(public newbieUserId: string, public lineId: string, public simplePeerSignal: any) {}
}

export class RtcReceiveAnswerResponse {
  constructor(public masterUserId: string, public lineId: string, public simplePeerSignal: any) {}
}

export class FlowStateRequest {
  constructor() {}
}
