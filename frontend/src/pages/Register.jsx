import {
  Code,
  Eye,
  EyeOff,
  Layers,
  Lock,
  Mail,
  User,
  UserPlus
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import registerImg from "../assets/register.png";
import ThemeButton from "../components/common/ThemeButton";
function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [description, setDescription] = useState("");

  const [languages, setLanguages] = useState([]);
  const [techStack, setTechStack] = useState([]);
  const [roles, setRoles] = useState([]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const languageOptions = ["JavaScript","Python","Java","C++","C#","Go","Ruby"];
  const techStackOptions = ["MERN","MEAN","Spring Boot","Django","Next.js"];
  const rolesOptions = ["Frontend","Backend","Fullstack","DevOps","UI/UX"];

const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("🚀 SUBMIT CLICKED");

  console.log("STATE VALUES:");
  console.log("username:", username);
  console.log("email:", email);
  console.log("description:", description);
  console.log("languages:", languages);
  console.log("techStack:", techStack);
  console.log("roles:", roles);

  if (!username.trim() || !email.trim() || !password || !confirmPassword)
    return alert("All fields required");

  if (password !== confirmPassword)
    return alert("Passwords do not match");

  if (!languages.length || !techStack.length || !roles.length) {
    console.log("❌ One of the arrays is empty");
    return alert("Select at least one in each category");
  }

  const payload = {
    username: username.trim(),
    email: email.trim(),
    password,
    confirmPassword,
    description: description.trim(),
    languages: [...languages],
    techStack: [...techStack],
    roles: [...roles],
  };

  console.log("📦 FINAL PAYLOAD:");
  console.log(JSON.stringify(payload, null, 2));

  setLoading(true);

  try {
    const response = await api.post("/auth/register", payload);
    console.log("✅ BACKEND RESPONSE:", response.data);

    navigate("/login");
  } catch (err) {
    console.error("❌ REGISTER ERROR:", err.response?.data || err);
    alert(err.response?.data?.message || "Registration failed");
  } finally {
    setLoading(false);
  }
};

  const MultiSelect = ({ label, options, selected, setSelected, icon }) => (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium mb-1">
        {icon}
        {label}
      </label>

      <select
        className="select select-bordered w-full"
        onChange={(e) => {
          if (e.target.value && !selected.includes(e.target.value)) {
            setSelected([...selected, e.target.value]);
          }
        }}
        value=""
      >
        <option value="" disabled>
          Select {label}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>

      <div className="flex flex-wrap gap-2 mt-2">
        {selected.map((item) => (
          <div key={item} className="badge badge-primary gap-1">
            {item}
            <span
              className="cursor-pointer"
              onClick={() =>
                setSelected(selected.filter((v) => v !== item))
              }
            >
              ×
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="relative w-full max-w-6xl">

        {/* Theme Button */}
        <div className="fixed top-4 right-60 z-50">
          <ThemeButton size={50} />
        </div>

        <div className="card card-side shadow-xl border rounded-2xl overflow-hidden">

          {/* Left Section */}
        <div className="w-1/3 bg-primary/10 flex items-center justify-center">
  <div className="w-60 h-60 rounded-full bg-primary/20 flex items-center justify-center">
    {/* Replace SVG with normal image */}
    <img
      src={registerImg}           // your downloaded register image
      alt="Register"
      className="w-46 h-46 object-contain"
    />
  </div>
</div>
          {/* Right Form Section */}
          <div className="w-2/3 p-10">
            <h1 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Create Account
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Username + Email side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  <input
                    type="text"
                    placeholder="Username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input input-bordered w-full pl-10"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input input-bordered w-full pl-10"
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    required
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

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input input-bordered w-full pl-10 pr-10"
                  />
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4 opacity-60" />
                    ) : (
                      <Eye className="w-4 h-4 opacity-60" />
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <textarea
                rows={3}
                placeholder="Tell us about yourself..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea textarea-bordered w-full"
              />

              {/* Multi selects */}
              <MultiSelect
                label="Languages"
                options={languageOptions}
                selected={languages}
                setSelected={setLanguages}
                icon={<Code className="w-4 h-4 opacity-60" />}
              />

              <MultiSelect
                label="Tech Stack"
                options={techStackOptions}
                selected={techStack}
                setSelected={setTechStack}
                icon={<Layers className="w-4 h-4 opacity-60" />}
              />

              <MultiSelect
                label="Roles"
                options={rolesOptions}
                selected={roles}
                setSelected={setRoles}
                icon={<UserPlus className="w-4 h-4 opacity-60" />}
              />

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? "Creating..." : "Register"}
              </button>
            </form>

            <p className="text-sm mt-6 opacity-60">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
