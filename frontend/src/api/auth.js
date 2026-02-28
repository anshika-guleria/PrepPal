import axios from "../utils/axios";

export const loginUser = (data) =>
  axios.post("/auth/login", data);

export const registerUser = (data) =>
  axios.post("/auth/register", data);

export const getMe = () =>
  axios.get("/auth/me");

export const logoutUser = () =>
  axios.post("/auth/logout");
