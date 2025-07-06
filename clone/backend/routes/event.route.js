import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    getFeedEvents,
    createEvent,
    deleteEvent,
    getEventById,
    createComment,
    likeEvent,
    getMyEvents,
    getEventApplications,
    applyEvent, // ✅ Add this function to the controller
} from "../controllers/event.controller.js";

const router = express.Router();

router.get("/", protectRoute, getFeedEvents);
router.post("/create", protectRoute, createEvent);
router.delete("/delete/:id", protectRoute, deleteEvent);
router.get("/:id", protectRoute, getEventById);
router.get("/:eventId/applications", protectRoute, getEventApplications);
router.post("/:id/comment", protectRoute, createComment);
router.post("/:id/like", protectRoute, likeEvent);
router.post("/apply/:id", protectRoute, applyEvent);
router.get("/my-events/:userId", protectRoute, getMyEvents);
export default router;
