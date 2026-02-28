import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import userRoutes from "./routes/user.routes.js";
import { initSocket } from "./socket/socket.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ======================
   CREATE HTTP SERVER
====================== */
const server = http.createServer(app);

/* ======================
   CONNECT DATABASE
====================== */
connectDB();

/* ======================
   MIDDLEWARE
====================== */

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" })); // allow image base64
app.use(cookieParser());

/* ======================
   ROUTES
====================== */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("PrepPal Backend is running 🚀");
});

/* ======================
   INITIALIZE SOCKET
====================== */
initSocket(server);

/* ======================
   GLOBAL ERROR HANDLER
====================== */
app.use((err, req, res, next) => {
  console.error("Global Error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

/* ======================
   START SERVER
====================== */
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket running on port ${PORT}`);
});
