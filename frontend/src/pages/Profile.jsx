import {
  Code,
  Layers,
  Mail,
  User,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";

function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);

  const languageOptions = ["JavaScript","Python","Java","C++","C#","Go","Ruby"];
  const techStackOptions = ["MERN","MEAN","Spring Boot","Django","Next.js"];
  const rolesOptions = ["Frontend","Backend","Fullstack","DevOps","UI/UX"];

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    description: "",
    languages: [],
    techStack: [],
    roles: [],
  });

  // =========================
  // FETCH PROFILE FROM BACKEND ON LOAD
  // =========================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");

        // Update auth context
        setUser(res.data);

        // Sync form with backend data
        setFormData({
          username: res.data.username || "",
          email: res.data.email || "",
          description: res.data.description || "",
          languages: res.data.languages || [],
          techStack: res.data.techStack || [],
          roles: res.data.roles || [],
        });

      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // =========================
  // MultiSelect Component
  // =========================
  const MultiSelect = ({ label, options, selected, setSelected, icon }) => (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium mb-1">
        {icon}
        {label}
      </label>

      <select
        className="select select-bordered w-full"
        value=""
        onChange={(e) => {
          if (e.target.value && !selected.includes(e.target.value)) {
            setSelected([...selected, e.target.value]);
          }
        }}
      >
        <option value="" disabled>
          Select {label}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <div className="flex flex-wrap gap-2 mt-2">
        {selected.length === 0 ? (
          <p className="text-xs opacity-50">No selection</p>
        ) : (
          selected.map((item) => (
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
          ))
        )}
      </div>
    </div>
  );

  // =========================
  // Save Changes
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.patch("/users/me/profile", {
        description: formData.description,
        languages: formData.languages,
        techStack: formData.techStack,
        roles: formData.roles,
      });

      // Update auth context
      setUser(res.data);

      alert("Profile updated successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 py-10">
      <div className="w-full max-w-6xl">
        <div className="card card-side shadow-xl border rounded-2xl overflow-hidden">

          {/* LEFT SECTION */}
          <div className="w-1/3 bg-primary/10 flex items-center justify-center">
            <div className="w-60 h-60 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-primary" />
              )}
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="w-2/3 p-10">
            <h1 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Edit Profile
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  <input
                    type="text"
                    value={formData.username}
                    disabled
                    className="input input-bordered w-full pl-10 opacity-60 cursor-not-allowed"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="input input-bordered w-full pl-10 opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>

              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="textarea textarea-bordered w-full"
              />

              <MultiSelect
                label="Languages"
                options={languageOptions}
                selected={formData.languages}
                setSelected={(val) =>
                  setFormData({ ...formData, languages: val })
                }
                icon={<Code className="w-4 h-4 opacity-60" />}
              />

              <MultiSelect
                label="Tech Stack"
                options={techStackOptions}
                selected={formData.techStack}
                setSelected={(val) =>
                  setFormData({ ...formData, techStack: val })
                }
                icon={<Layers className="w-4 h-4 opacity-60" />}
              />

              <MultiSelect
                label="Roles"
                options={rolesOptions}
                selected={formData.roles}
                setSelected={(val) =>
                  setFormData({ ...formData, roles: val })
                }
                icon={<UserPlus className="w-4 h-4 opacity-60" />}
              />

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;