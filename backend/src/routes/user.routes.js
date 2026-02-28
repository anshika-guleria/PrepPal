import express from "express";
import {
    getMyConnections,
    getMyProfile,
    getUserProfile,
    listUsers,
    unfriendUser,
    updateMyProfile,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/* ==========================
   MY PROFILE
========================== */

router.get("/me/profile", protect, getMyProfile);
router.patch("/me/profile", protect, updateMyProfile);

/* ==========================
   CONNECTIONS
========================== */

router.get("/me/connections", protect, getMyConnections);

/* ==========================
   USERS
========================== */

router.get("/", protect, listUsers);
router.get("/username/:username", protect, getUserProfile);

/* ==========================
   FRIENDS
========================== */

router.delete("/friends/:userId", protect, unfriendUser);

export default router;