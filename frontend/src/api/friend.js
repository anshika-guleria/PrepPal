import api from "./axios";

export const sendFriendRequest = (toUserId) =>
  api.post("/request", { toUserId });

export const acceptFriendRequest = (requestId) =>
  api.post("/request/accept", { requestId });

export const rejectFriendRequest = (requestId) =>
  api.post("/request/reject", { requestId });
