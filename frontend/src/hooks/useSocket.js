import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const useSocket = (userId) => {
  const [connected, setConnected] = useState(false);

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

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
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

  return { socket, connected, sendTyping, stopTyping };
};

export default useSocket;