import express from "express";
import {
   acceptFriendRequest,
   deleteMessage,
   getConversation,
   getMyChats,
   getMyConnections,
   rejectFriendRequest,
   sendFriendRequest,
   sendMessage
} from "../controllers/chat.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/* ==========================
   FRIEND REQUESTS
========================== */

router.post("/request", protect, sendFriendRequest);
router.post("/request/accept", protect, acceptFriendRequest);
router.post("/request/reject", protect, rejectFriendRequest);

/* ==========================
   CONNECTIONS (Friends List)
========================== */

router.get("/connections", protect, getMyConnections);

/* ==========================
   MESSAGES
========================== */

router.post("/send", protect, sendMessage);
router.get("/conversation/:userId", protect, getConversation);
router.get("/my-chats", protect, getMyChats);
router.delete("/message/:messageId", protect, deleteMessage);

export default router;