import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

const useFriends = () => {
  const [friends, setFriends] = useState([]);
  const [pendingSent, setPendingSent] = useState([]);
  const [pendingReceived, setPendingReceived] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true);

      // ✅ Correct route (NEW)
      const res = await api.get("/chat/connections");

      setFriends(res.data.friends || []);
      setPendingSent(res.data.pendingSent || []);
      setPendingReceived(res.data.pendingReceived || []);

    } catch (err) {
      console.error("Failed to fetch connections:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  return {
    friends,
    pendingSent,
    pendingReceived,
    loading,
    refetch: fetchConnections,
  };
};

export default useFriends;