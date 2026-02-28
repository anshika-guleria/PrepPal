import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // axios with withCredentials: true
import AuthContext from "./AuthContext";

const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ==================== Load current user ====================
  useEffect(() => {
    let isMounted = true;

    const fetchMe = async () => {
      try {
        // axios will automatically send the httpOnly cookie
        const res = await api.get("/auth/me");
        if (isMounted) {
          setUser(res.data);
          // save userId for sockets or other usage
          localStorage.setItem("userId", res.data._id);
        }
      } catch (err) {
  // Ignore 401 (unauthorized) since user may not be logged in yet
  if (err.response?.status && err.response.status !== 401) {
    console.error("Failed to fetch user:", err);
  }
  setUser(null);
  localStorage.removeItem("userId");
}finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMe();

    return () => { isMounted = false; };
  }, []);

  // ==================== Login ====================
  // Backend sets httpOnly cookie, so no token needed in localStorage
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("userId", userData._id); // optional for socket usage
  };

  // ==================== Logout ====================
  const logout = async () => {
    try {
      await api.post("/auth/logout"); // backend clears cookie
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("userId");
      navigate("/login", { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;