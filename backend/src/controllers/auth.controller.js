import { generateToken } from "../config/jwt.js";
import User from "../models/User.js";

// REGISTER
export const register = async (req, res) => {
  try {
     console.log("📥 RAW REQ BODY:", req.body);
    const {
      username,
      email,
      password,
      confirmPassword,
      description,
      languages,
      techStack,
      roles,
    } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email or username already taken",
      });
    }

    const profileImage = `https://api.dicebear.com/9.x/big-smile/svg?seed=${username}`;

    const user = await User.create({
      username,
      email,
      password,
      profileImage,
      description: description || "",
      languages: Array.isArray(languages) ? languages : [],
      techStack: Array.isArray(techStack) ? techStack : [],
      roles: Array.isArray(roles) ? roles : [],
    });

    const token = generateToken(user._id);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        description: user.description,
        languages: user.languages,
        techStack: user.techStack,
        roles: user.roles,
      });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
    .status(200)
    .json({ message: "Logged out successfully" });
};

// GET CURRENT USER
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-password")
      .populate("friends", "username profileImage")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
        // Add defaults if undefined
    user.description = user.description || "";
    user.languages = user.languages || [];
    user.techStack = user.techStack || [];
    user.roles = user.roles || [];


    // ✅ Return full user object
    res.status(200).json(user);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
