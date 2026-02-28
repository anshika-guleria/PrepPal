import PropTypes from "prop-types";

function ChatList({ chats = [], onSelectChat }) {
  return (
    <div className="chat-list w-72 bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3 overflow-y-auto max-h-screen">
      {chats.length === 0 ? (
        <p className="text-sm text-slate-500 text-center mt-4">
          No active chats
        </p>
      ) : (
        chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className="chat-item flex items-center gap-3 p-2 rounded-lg hover:bg-indigo-50 cursor-pointer transition"
          >
            {/* Avatar */}
            <img
              src={chat.avatar || "/default-avatar.png"}
              alt={chat.name}
              className="w-12 h-12 rounded-full border-2 border-indigo-200 object-cover"
            />

            {/* Name + Last Message */}
            <div className="flex flex-col overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {chat.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {chat.lastMessage || "Say hi!"}
              </p>
            </div>

            {/* Online Indicator */}
            {chat.online && (
              <span className="ml-auto w-3 h-3 rounded-full bg-green-500 border border-white" />
            )}
          </div>
        ))
      )}
    </div>
  );
}

// Props validation
ChatList.propTypes = {
  chats: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
      lastMessage: PropTypes.string,
      online: PropTypes.bool,
    })
  ),
  onSelectChat: PropTypes.func.isRequired,
};

export default ChatList;
