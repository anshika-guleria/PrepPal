import PropTypes from "prop-types";

function FriendCard({
  name,
  avatar,
  lastMessage = "Hi, wanna revise OS?",
  time = "2:15 PM",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-3 rounded-xl cursor-pointer hover:bg-indigo-50 transition-shadow shadow-sm hover:shadow-md"
    >
      {/* Avatar */}
      <img
        src={avatar || "/default-avatar.png"}
        alt={name}
        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200 transition-transform hover:scale-105"
      />

      {/* Name + Last Message */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {name}
        </p>
        <p className="text-xs text-slate-500 truncate">
          {lastMessage}
        </p>
      </div>

      {/* Time */}
      {time && (
        <p className="text-xs text-slate-400 flex-shrink-0">
          {time}
        </p>
      )}
    </div>
  );
}

FriendCard.propTypes = {
  name: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  lastMessage: PropTypes.string,
  time: PropTypes.string,
  onClick: PropTypes.func,
};

export default FriendCard;