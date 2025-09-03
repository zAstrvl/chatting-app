import express from "express";
import { protectRoute } from "../middleware/auth.middleware";
import { getUsersForSideBar, getMessages } from "../controllers/message.controller";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSideBar);
router.get("/:id", protectRoute, getMessages);
router.post("/:id", protectRoute, sendMessage);

export default router;