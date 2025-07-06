import express from "express";
import {protectRoute} from "../middleware/auth.middleware.js";
import { getUsersForSidebar } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUsersForSidebar);

export default router;