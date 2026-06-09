import express from "express";
import { test, ingest, campaign } from "./controller.js";

const router = express.Router();

router.get("/test", test);
router.post("/ingest", ingest);
router.post("/campaign", campaign);

export default router;