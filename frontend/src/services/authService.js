import * as api from "../api/auth";

export const login = async (data) => {
  const res = await api.loginUser(data);
  localStorage.setItem("token", res.data.token);
  return res.data;
};

export const register = async (data) => {
  const res = await api.registerUser(data);
  localStorage.setItem("token", res.data.token);
  return res.data;
};

export const fetchMe = async () => {
  const res = await api.getMe();
  return res.data;
};

export const logout = async () => {
  await api.logoutUser();
  localStorage.removeItem("token");
};
