import express from "express";
import getUserRoutes from "./user";

export default function getRoutes() {
  const router = express.Router();

  router.use("/users", getUserRoutes());

  return router;
}
