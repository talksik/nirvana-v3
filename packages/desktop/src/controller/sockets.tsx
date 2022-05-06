import SocketChannels from "@nirvana/core/sockets/channels";
import { io } from "socket.io-client";

const $ws = io("http://localhost:5000");

export default $ws;
