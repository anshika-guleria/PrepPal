import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Rnd } from "react-rnd";
import api from "../api/axios";
import ChatWindow from "../components/chat/ChatWindow";
import FriendCard from "../components/users/FriendCard";
import FriendRequestCard from "../components/users/FriendRequestCard";
import SuggestedUserCard from "../components/users/SuggestedUserCard";
import useFriends from "../hooks/useFriends";
import useSocket from "../hooks/useSocket";
import useUsers from "../hooks/useUsers";

const languageOptions = ["JavaScript", "Python", "Java", "C++", "C#", "Go", "Ruby"];
const techStackOptions = ["MERN", "MEAN", "Spring Boot", "Django", "Next.js"];
const rolesOptions = ["Frontend", "Backend", "Fullstack", "DevOps", "UI/UX"];

function Home() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);

  const [filterLanguage, setFilterLanguage] = useState("");
  const [filterTech, setFilterTech] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const {
    friends = [],
    pendingSent = [],
    pendingReceived = [],
    loading,
    refetch,
  } = useFriends();

  /* ===============================
     FILTER CHECK (STABLE)
  =============================== */
  const isFiltering =
    filterLanguage !== "" ||
    filterTech !== "" ||
    filterRole !== "";

  /* ===============================
     USERS (STABLE VERSION)
  =============================== */

  // Suggested (always primitive values)
  const {
    users: suggestedUsers = [],
    loading: suggestedLoading,
  } = useUsers("", "", "", 1, 10);

  // Filtered (only active when filtering)
  const {
    users: filteredUsers = [],
    loading: filteredLoading,
  } = useUsers(
    isFiltering ? filterLanguage : "",
    isFiltering ? filterTech : "",
    isFiltering ? filterRole : "",
    1,
    10
  );

  /* ===============================
     CURRENT USER LOAD
  =============================== */
  useEffect(() => {
    let isMounted = true;

    async function fetchUser() {
      const storedId = localStorage.getItem("userId");

      if (storedId && isMounted) {
        setCurrentUserId(storedId);
      } else {
        try {
          const res = await api.get("/auth/me");
          if (res.data?._id && isMounted) {
            localStorage.setItem("userId", res.data._id);
            setCurrentUserId(res.data._id);
          }
        } catch (err) {
          console.warn("Failed to fetch user", err);
        }
      }
    }

    fetchUser();
    return () => (isMounted = false);
  }, []);

  const { socket, onlineUsers } = useSocket(currentUserId);

  /* ===============================
     FRIEND STATUS
  =============================== */
  const getStatus = (user) => {
    if (!user?._id) return "none";
    const id = user._id.toString();

    if (friends.some((f) => f._id.toString() === id)) return "friend";
    if (pendingSent.some((r) => r?.to?._id?.toString() === id)) return "sent";
    if (pendingReceived.some((r) => r?.from?._id?.toString() === id)) return "received";
    return "none";
  };

  /* ===============================
     REQUEST HANDLERS
  =============================== */
  const handleSendRequest = async (userId) => {
    await api.post("/chat/request", { toUserId: userId });
    refetch();
  };

  const handleAccept = async (requestId) => {
    await api.post("/chat/request/accept", { requestId });
    refetch();
  };

  const handleReject = async (requestId) => {
    await api.post("/chat/request/reject", { requestId });
    refetch();
  };

  /* ===============================
     RENDER USERS
  =============================== */
  const renderUsers = (list) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {list.map((user) => (
        <SuggestedUserCard
          key={user._id}
          user={user}
          status={getStatus(user)}
          onSend={() => handleSendRequest(user._id)}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200">
      <div className="p-6 flex flex-col lg:flex-row gap-6 mt-6">

        {/* SIDEBAR */}
        <aside className="bg-base-100 p-4 rounded-2xl shadow-md border w-full lg:w-1/4">
          <h2 className="text-lg font-bold mb-3">My Friends</h2>

          {loading ? (
            <span className="loading loading-spinner loading-md mx-auto"></span>
          ) : friends.length === 0 ? (
            <p className="text-sm opacity-60">No friends yet.</p>
          ) : (
           friends.map((friend) => (
  <FriendCard
    key={friend._id}
    name={friend.username}
    avatar={friend.profileImage || "/default-avatar.png"}
    isOnline={onlineUsers?.includes(friend._id)}
    onClick={() => setSelectedChat(friend)}
  />
))
          )}
        </aside>

        {/* MAIN */}
        <main className="flex-1 space-y-8">

          {/* FRIEND REQUESTS */}
          <section className="bg-base-100 p-6 rounded-2xl shadow-md border">
            <h2 className="text-lg font-bold mb-4">Friend Requests</h2>

            {pendingReceived.length === 0 ? (
              <p className="opacity-60">No pending requests</p>
            ) : (
              pendingReceived.map((req) => (
                <FriendRequestCard
                  key={req._id}
                  user={req.from}
                  onAccept={() => handleAccept(req._id)}
                  onReject={() => handleReject(req._id)}
                />
              ))
            )}
          </section>

          {/* DISCOVER USERS */}
          <section className="space-y-6">
            <h2 className="text-lg font-bold">Discover Study Partners</h2>

            {/* FILTERS */}
            <div className="bg-base-100 p-5 rounded-2xl border shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <select
                  className="select select-bordered"
                  value={filterLanguage}
                  onChange={(e) => setFilterLanguage(e.target.value)}
                >
                  <option value="">All Languages</option>
                  {languageOptions.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>

                <select
                  className="select select-bordered"
                  value={filterTech}
                  onChange={(e) => setFilterTech(e.target.value)}
                >
                  <option value="">All Tech Stacks</option>
                  {techStackOptions.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>

                <select
                  className="select select-bordered"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="">All Roles</option>
                  {rolesOptions.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SUGGESTED */}
            {!isFiltering && (
              <>
                <h3 className="font-semibold text-base">Suggested For You</h3>
                {suggestedLoading ? (
                  <p>Loading...</p>
                ) : suggestedUsers.length === 0 ? (
                  <p className="opacity-60">No suggestions available</p>
                ) : (
                  renderUsers(suggestedUsers)
                )}
              </>
            )}

            {/* FILTERED */}
            {isFiltering && (
              <>
                <h3 className="font-semibold text-base text-primary">
                  Filtered Results
                </h3>
                {filteredLoading ? (
                  <p>Loading...</p>
                ) : filteredUsers.length === 0 ? (
                  <p className="opacity-60">No users found</p>
                ) : (
                  renderUsers(filteredUsers)
                )}
              </>
            )}
          </section>
        </main>
      </div>

      {/* FLOATING CHAT */}
      {selectedChat && currentUserId && (
        <Rnd
          default={{
            x: window.innerWidth - 320,
            y: window.innerHeight - 420,
            width: 300,
            height: 400,
          }}
          minWidth={250}
          minHeight={300}
          bounds="window"
          className="z-50 absolute"
        >
          <div className="relative w-full h-full flex flex-col">
            <ChatWindow
              friend={selectedChat}
              currentUser={{ _id: currentUserId }}
              socket={socket}
            />
            <button
              onClick={() => setSelectedChat(null)}
              className="absolute -top-4 -right-4 text-red-500 w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md"
            >
              <X size={20} />
            </button>
          </div>
        </Rnd>
      )}
    </div>
  );
}

export default Home;