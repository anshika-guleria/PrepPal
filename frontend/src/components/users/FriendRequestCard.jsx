import PropTypes from "prop-types";

function FriendRequestCard({ user, onAccept, onReject }) {
  if (!user) return null;

  const {
    username,
    profileImage,
    bio,
    techStack = [],
    languages = [],
    roles = [],
  } = user;

  return (
    <div className="friend-request-card flex items-center justify-between bg-base-100 rounded-2xl shadow-lg p-4 hover:shadow-xl transition">
      
      {/* Avatar */}
      <img
        src={profileImage || "/default-avatar.png"}
        alt={username}
        className="w-20 h-20 rounded-full object-cover border-2 border-primary"
      />

      {/* Info Section */}
      <div className="flex-1 ml-4 min-w-0">
        <p className="text-sm font-semibold truncate">
          {username}
        </p>

        {bio && (
          <p className="text-xs text-base-content/60 truncate mt-1">
            {bio}
          </p>
        )}

        {/* Inline Details */}
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-base-content/70">
          {techStack.length > 0 && (
            <p>
              <span className="font-medium">Tech:</span>{" "}
              {techStack.join(", ")}
            </p>
          )}

          {languages.length > 0 && (
            <p>
              <span className="font-medium">Languages:</span>{" "}
              {languages.join(", ")}
            </p>
          )}

          {roles.length > 0 && (
            <p>
              <span className="font-medium">Roles:</span>{" "}
              {roles.join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2 ml-4">
        <button
          onClick={onAccept}
          className="btn btn-primary btn-sm px-10"
        >
          Accept
        </button>

        <button
          onClick={onReject}
          className="btn btn-outline btn-secondary btn-sm px-10"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

FriendRequestCard.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    username: PropTypes.string,
    profileImage: PropTypes.string,
    bio: PropTypes.string,
    techStack: PropTypes.arrayOf(PropTypes.string),
    languages: PropTypes.arrayOf(PropTypes.string),
    roles: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onAccept: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};

export default FriendRequestCard;