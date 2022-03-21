import express, { Application, Request, Response } from "express";

import { NextFunction } from "express";
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

const server = new http.Server(app);
server.listen(5000, () =>
  console.log("Example app is listening on port 5000.")
);

const io = require("socket.io")(server);

io.on("connection", function (socket: any) {
  console.log("a user connected");
});

connectToDatabase();
