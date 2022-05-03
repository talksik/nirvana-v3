export default interface ReceiveSignal {
  simplePeerSignal: any;

  senderUserSocketId: string;

  isGoingBackToInitiator?: boolean;
}
