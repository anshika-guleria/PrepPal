import PropTypes from "prop-types";

function SuggestedUserCard({ user, status = "none", onSend }) {
  if (!user) return null;

  const {
    username,
    profileImage,
    description,
    techStack = [],
    languages = [],
    roles = [],
  } = user;

  const bioText =
    description && description.trim().length > 0
      ? description
      : "No bio available";

  return (
    <div className="card bg-base-100 shadow-md rounded-2xl p-4 hover:shadow-lg transition flex flex-col">
      
      {/* Avatar */}
      <div className="flex items-center gap-4 mb-3">
        <div className="avatar">
          <div className="w-20 h-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img
              src={profileImage || "/default-avatar.png"}
              alt={username}
              className="object-cover"
            />
          </div>
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-base-content">
            {username}
          </p>

          {/* ✅ FULL DESCRIPTION NOW VISIBLE */}
          <p className="text-xs text-base-content/60 break-words whitespace-pre-wrap">
            {bioText}
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 text-xs text-base-content/80 mb-4">
        {techStack.length > 0 && (
          <span className="badge badge-outline">
            Tech: {techStack.join(", ")}
          </span>
        )}
        {languages.length > 0 && (
          <span className="badge badge-outline">
            Languages: {languages.join(", ")}
          </span>
        )}
        {roles.length > 0 && (
          <span className="badge badge-outline">
            Roles: {roles.join(", ")}
          </span>
        )}
      </div>

      {/* Button */}
      <div className="text-center mt-auto">
        {status === "none" && (
          <button onClick={onSend} className="btn btn-primary btn-sm">
            Connect
          </button>
        )}

        {status === "sent" && (
          <button className="btn btn-disabled btn-sm">
            Request Sent
          </button>
        )}

        {status === "friend" && (
          <button className="btn btn-success btn-sm" disabled>
            Friends
          </button>
        )}

        {status === "received" && (
          <button className="btn btn-warning btn-sm" disabled>
            Check Requests
          </button>
        )}
      </div>
    </div>
  );
}

SuggestedUserCard.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    username: PropTypes.string,
    profileImage: PropTypes.string,
    description: PropTypes.string,
    techStack: PropTypes.array,
    languages: PropTypes.array,
    roles: PropTypes.array,
  }).isRequired,
  status: PropTypes.oneOf(["none", "sent", "friend", "received"]),
  onSend: PropTypes.func,
};

export default SuggestedUserCard;