import axios from "../utils/axios";

export const getSuggestedUsers = () =>
  axios.get("/users/suggested");

export const sendFriendRequest = (id) =>
  axios.post(`/users/friend-request/${id}`);

export const getFriendRequests = () =>
  axios.get("/users/friend-requests");

export const respondToRequest = (id, action) =>
  axios.put(`/users/friend-request/${id}`, { action });
