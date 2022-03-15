import express, { Application, Request, Response } from "express";

import { NextFunction } from "express";
import cors from "cors";
import getRoutes from "./routes";

const app = express();

app.use(cors());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log("Time: ", Date.now());
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.send("hello world.");
});

app.use("/api", getRoutes());

app.listen(5000, () => console.log("Example app is listening on port 5000."));
