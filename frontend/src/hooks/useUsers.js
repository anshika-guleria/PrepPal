import { useEffect, useState } from "react";
import api from "../api/axios";

/**
 * Stable user fetching hook
 * Accepts primitive values only (strings + numbers)
 * This prevents infinite re-fetch loops.
 */
const useUsers = (
  languages = "",
  techStack = "",
  roles = "",
  page = 1,
  limit = 10
) => {
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        setLoading(true);

        const params = { page, limit };

        if (languages) params.languages = languages;
        if (techStack) params.techStack = techStack;
        if (roles) params.roles = roles;

        console.log("📤 Sending Query Params:", params);

        const res = await api.get("/users", { params });

        if (!isMounted) return;

        setUsers(res.data?.users || []);
        setTotalPages(res.data?.totalPages || 1);

      } catch (error) {
        console.error("❌ Failed to fetch users:", error);

        if (isMounted) {
          setUsers([]);
          setTotalPages(1);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };

  }, [languages, techStack, roles, page, limit]);

  return {
    users,
    totalPages,
    loading,
  };
};

export default useUsers;