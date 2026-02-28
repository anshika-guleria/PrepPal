import { Server } from "socket.io";
import Message from "../models/Message.js";

let io;

/* ======================
   INIT SOCKET
====================== */
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth?.userId;

    if (!userId) {
      console.log("❌ Socket connection failed: no userId provided");
      socket.disconnect();
      return;
    }

    socket.userId = userId;
    console.log("🟢 User connected:", socket.userId);

    // Join user's private room
    socket.join(socket.userId.toString());

   /* ===== REAL-TIME MESSAGES ===== */
socket.on("sendMessage", async (msg, callback) => {
  const { receiverId, text, type, attachmentBase64, attachmentType, callLink } = msg;
  if (!receiverId) return;

  const messageData = {
    sender: socket.userId,
    receiver: receiverId,
    text: text || "",
    type: type || "text",
    callLink: callLink || "",
  };

  if (attachmentBase64 && attachmentType) {
    messageData.attachment = { base64: attachmentBase64, type: attachmentType };
  }

  const message = await Message.create(messageData);
  await message.populate("sender", "username profileImage");
  await message.populate("receiver", "username profileImage");

  io.to(socket.userId.toString()).to(receiverId.toString()).emit("newMessage", message);

  if (callback) callback(message);
});

    /* ===== VIDEO CALL LINK ===== */
    socket.on("startVideoCall", ({ receiverId, callLink }) => {
      if (!receiverId || !callLink) return;

      io.to(receiverId.toString()).emit("incomingVideoCall", {
        from: socket.userId,
        callLink,
      });

      console.log(`📹 Video call link sent from ${socket.userId} to ${receiverId}`);
    });
socket.on("endVideoCall", ({ receiverId }) => {
  if (!receiverId) return;

  io.to(receiverId.toString()).emit("videoCallEnded", {
    from: socket.userId,
  });

  console.log(`📴 Video call ended by ${socket.userId} for ${receiverId}`);
});
    /* ===== TYPING INDICATORS ===== */
    socket.on("typing", ({ userId }) => {
      if (userId) io.to(userId).emit("typing", { userId: socket.userId });
    });

    socket.on("stopTyping", ({ userId }) => {
      if (userId) io.to(userId).emit("stopTyping", { userId: socket.userId });
    });

    /* ===== DISCONNECT ===== */
    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.userId);
    });
  });
};

/* ======================
   GET IO INSTANCE
====================== */
export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};