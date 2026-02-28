import { Video } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

function ChatWindow({ friend, socket, currentUser }) {
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);

  // ================= FETCH OLD MESSAGES =================
  useEffect(() => {
    if (!friend || !currentUser?._id) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/chat/conversation/${friend._id}`,
          { credentials: "include" }
        );

        const data = await res.json();
        console.log("[DEBUG] Fetched messages:", data.length);

        setMessages(
          data.map((msg) => ({
            _id: msg._id,
            senderId: msg.sender._id,
            senderUsername: msg.sender.username,
            receiverId: msg.receiver._id,
            text: msg.text || "",
            file: msg.attachment || null, // ⚠ file object from backend
            fileType:
              msg.type === "attachment"
                ? msg.attachment?.type || "file"
                : "text",
            type: msg.type || "text",
            callLink: msg.callLink || "",
            createdAt: msg.createdAt,
            sentByMe: msg.sender._id === currentUser._id,
          }))
        );
      } catch (err) {
        console.error("[DEBUG] Failed to fetch messages:", err);
      }
    };

    fetchMessages();
  }, [friend, currentUser]);

  // ================= REALTIME SOCKET =================
  useEffect(() => {
    if (!socket || !friend) return;

    const handleNewMessage = (msg) => {
      const isRelevant =
        msg.sender._id === friend._id ||
        msg.receiver._id === friend._id;

      if (!isRelevant) return;

      console.log("[DEBUG] New socket message received:", msg);

      const mappedMessage = {
        _id: msg._id,
        senderId: msg.sender._id,
        senderUsername: msg.sender.username,
        receiverId: msg.receiver._id,
        text: msg.text || "",
        file: msg.attachment || null, // can be base64 or Cloudinary URL
        fileType:
          msg.type === "attachment"
            ? msg.attachment?.type || "file"
            : "text",
        type: msg.type || "text",
        callLink: msg.callLink || "",
        createdAt: msg.createdAt,
        sentByMe: msg.sender._id === currentUser._id,
      };

      setMessages((prev) => {
        const tempIndex = prev.findIndex(
          (m) =>
            m._id.startsWith("temp-") &&
            m.text === mappedMessage.text
        );

        if (tempIndex >= 0) {
          const updated = [...prev];
          updated[tempIndex] = mappedMessage;
          console.log("[DEBUG] Replaced temp message with backend message");
          return updated;
        }

        if (prev.some((m) => m._id === mappedMessage._id)) return prev;

        return [...prev, mappedMessage];
      });
    };

    const handleTyping = ({ userId }) => {
      if (userId !== friend._id) return;

      setTyping(true);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => setTyping(false), 1500);
    };

    const handleStopTyping = () => setTyping(false);

    socket.on("newMessage", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, friend, currentUser]);

  // ================= AUTO SCROLL =================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // ================= SEND MESSAGE =================
// ================= SEND MESSAGE =================
const handleSend = async (msgData) => {
  if (!friend) return;

  const tempId = `temp-${Date.now()}`;

  const payload = {
    receiverId: friend._id,
    text: msgData.text || "",
    type: msgData.file ? "attachment" : msgData.callLink ? "call" : "text",
    attachmentBase64: msgData.file?.base64 || "",
    attachmentType: msgData.file?.type || "",
    callLink: msgData.callLink || "",
  };

  console.log("[DEBUG] Sending message via API:", payload);

  // ✅ Optimistic UI (UNCHANGED)
  setMessages((prev) => [
    ...prev,
    {
      _id: tempId,
      senderId: currentUser._id,
      senderUsername: currentUser.username || "You",
      receiverId: friend._id,
      text: payload.text,
      file: msgData.file || null,
      fileType:
        payload.type === "attachment"
          ? msgData.file?.type || "file"
          : "text",
      type: payload.type,
      callLink: payload.callLink,
      createdAt: new Date().toISOString(),
      sentByMe: true,
    },
  ]);

  try {
    await fetch(`${import.meta.env.VITE_API_URL}/api/chat/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    // ❌ DO NOT add message here
    // Backend will emit via socket
  } catch (err) {
    console.error("[DEBUG] Failed to send message:", err);
  }
};

  // ================= START VIDEO CALL (link) =================
  const handleStartVideoCall = () => {
    if (!friend || !currentUser?._id) return;

    const callId = `${currentUser._id}-${friend._id}-${Date.now()}`;
    const callLink = `${window.location.origin}/call/${callId}`;

    handleSend({ text: "Video call invitation", callLink });
    window.open(callLink, "_blank");
  };

  // ================= UI =================
  if (!friend || !currentUser?._id) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500">
        Select a friend to start chatting
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-100 rounded-xl shadow-sm overflow-hidden">
      {/* TOP BAR */}
      <div className="flex items-center justify-between bg-white px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <img
            src={friend.profileImage || "/default-avatar.png"}
            alt={friend.username}
            className="w-10 h-10 rounded-full border-2 border-indigo-200 object-cover"
          />
          <p className="text-sm font-semibold text-slate-800">{friend.username}</p>
        </div>

        <button
          onClick={handleStartVideoCall}
          className="p-2 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition"
          title="Start video call"
        >
          <Video className="w-4 h-4" />
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500 text-center mt-4">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg._id} message={msg} sentByMe={msg.sentByMe} />
          ))
        )}

        {typing && <p className="text-xs text-gray-500 ml-2">Typing...</p>}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="bg-white p-4 border-t">
        <MessageInput
          onSend={handleSend}
          socket={socket}
          friendId={friend._id}
          currentUserId={currentUser._id}
        />
      </div>
    </div>
  );
}

ChatWindow.propTypes = {
  friend: PropTypes.object,
  socket: PropTypes.object,
  currentUser: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string,
  }).isRequired,
};

export default ChatWindow;