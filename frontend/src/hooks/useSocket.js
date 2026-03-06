import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const useSocket = (userId) => {
  const [connected, setConnected] = useState(false);

  // ⭐ NEW: track online users
  const [onlineUsers, setOnlineUsers] = useState([]);

  // ==================== Create socket once per user ====================
  const socket = useMemo(() => {
    if (!userId) return null;

    const s = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
      autoConnect: false,
      auth: { userId },
    });

    console.log("⚡ Socket instance created");
    return s;
  }, [userId]);

  // ==================== Connection Lifecycle ====================
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log("🟢 Socket connected:", socket.id);
      setConnected(true);
    };

    const handleDisconnect = () => {
      console.log("🔴 Socket disconnected");
      setConnected(false);
    };

    const handleConnectError = (err) => {
      console.error("❌ Socket connection error:", err.message);
    };

    // ⭐ NEW: presence handlers
    const handleUserOnline = (id) => {
      setOnlineUsers((prev) => [...new Set([...prev, id])]);
    };

    const handleUserOffline = (id) => {
      setOnlineUsers((prev) => prev.filter((u) => u !== id));
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    // ⭐ NEW events
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);

    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);

      // ⭐ NEW cleanup
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);

      socket.disconnect();
      console.log("⚡ Socket cleaned up");
    };
  }, [socket]);

  // ==================== Typing Helpers ====================
  const sendTyping = (receiverId) => {
    if (!socket?.connected) return;
    socket.emit("typing", { userId: receiverId });
  };

  const stopTyping = (receiverId) => {
    if (!socket?.connected) return;
    socket.emit("stopTyping", { userId: receiverId });
  };

  // ⭐ onlineUsers added to return
  return { socket, connected, onlineUsers, sendTyping, stopTyping };
};

export default useSocket;