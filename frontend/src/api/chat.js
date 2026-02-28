import api from "./axios";

// MESSAGES
export const sendMessage = (data) => api.post("/chat/send", data);
export const getConversation = (userId) => api.get(`/chat/conversation/${userId}`);
export const getMyChats = () => api.get("/chat/my-chats");
export const deleteMessage = (messageId) => api.delete(`/chat/message/${messageId}`);

// CONNECTIONS / FRIEND REQUESTS (if needed)
export const sendFriendRequest = (toUserId) =>
  api.post("/chat/request", { toUserId });
export const acceptFriendRequest = (requestId) =>
  api.post("/chat/request/accept", { requestId });
export const rejectFriendRequest = (requestId) =>
  api.post("/chat/request/reject", { requestId });
export const getMyConnections = () => api.get("/chat/connections");