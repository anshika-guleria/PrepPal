import PropTypes from "prop-types";

function FriendCard({ name, avatar, onClick }) {
  return (
    <div
      onClick={onClick}
      className="
        flex items-center gap-4 p-3 rounded-xl cursor-pointer
        border border-base-300
        bg-base-100
        hover:bg-base-200
        hover:border-primary
        hover:shadow-md
        transition-all duration-200
      "
    >
      {/* Avatar */}
      <img
        src={avatar || "/default-avatar.png"}
        alt={name}
        className="
          w-12 h-12 rounded-full object-cover
          border border-base-300
        "
      />

      {/* Name */}
      <p className="text-sm font-semibold text-base-content truncate">
        {name}
      </p>
    </div>
  );
}

FriendCard.propTypes = {
  name: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  onClick: PropTypes.func,
};

export default FriendCard;