import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import ThemeButton from "../common/ThemeButton";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (!user) return null;

  return (
    <div className="navbar bg-base-100 px-6 shadow-md border-b border-base-200">
      
      {/* Left */}
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="text-xl font-bold tracking-wide hover:text-primary transition"
        >
          PrepPal
        </Link>

        <ThemeButton />
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-4">

        {/* 👇 PROFILE LINK */}
        <Link
          to="/profile"
          className="flex items-center gap-2 hover:bg-base-200 px-3 py-1 rounded-lg transition"
        >
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt="profile"
              className="w-9 h-9 rounded-full object-cover border border-base-300"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
              {user.username?.charAt(0).toUpperCase()}
            </div>
          )}

          <span className="font-medium hidden sm:inline">
            {user.username}
          </span>
        </Link>

        <button
          onClick={handleLogout}
          className="btn btn-error btn-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;