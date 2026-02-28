import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import loginImg from "../assets/login.png";
import ThemeButton from "../components/common/ThemeButton";
import AuthContext from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(AuthContext);

  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await api.post("/auth/login", { email, password });

    // Save user in context
    setUser(res.data);

    // Save userId for sockets
    localStorage.setItem("userId", res.data._id);

    // Save token for API requests
    localStorage.setItem("token", res.data.token); // <-- important

    navigate("/");
  } catch (err) {
    alert(err.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="relative w-full max-w-4xl">

        {/* Theme Button */}
        <div className="absolute -top-11 right-0">
          <ThemeButton size={50} />
        </div>

        <div className="card card-side shadow-xl border rounded-2xl overflow-hidden">

          {/* Left */}
          <div className="w-1/2 flex items-center justify-center bg-primary/10">
            <div className="w-60 h-60 rounded-full bg-primary/20 flex items-center justify-center">
              <img
                src={loginImg}
                alt="Login"
                className="w-42 h-42 object-contain"
              />
            </div>
          </div>

          {/* Right */}
          <div className="w-1/2 p-10 flex flex-col justify-center">
            <h1 className="text-2xl font-semibold mb-3 flex items-center gap-2">
              <LogIn className="w-5 h-5 text-primary" />
              Welcome Back
            </h1>

            <p className="text-sm opacity-60 mb-6">
              Login to continue studying with your friends
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered w-full pl-10"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered w-full pl-10 pr-10"
                />
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 opacity-60" />
                  ) : (
                    <Eye className="w-4 h-4 opacity-60" />
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="text-sm opacity-60 mt-6">
              Don’t have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;