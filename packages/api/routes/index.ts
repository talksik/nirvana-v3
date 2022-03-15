import express from "express";
import getAuthRoutes from "./auth";

export default function getRoutes() {
  const router = express.Router();

  router.use("/auth", getAuthRoutes());

  return router;
}
