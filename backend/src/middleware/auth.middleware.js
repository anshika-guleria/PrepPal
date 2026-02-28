import { verifyToken } from "../config/jwt.js";
import User from "../models/User.js";

/**
 * Protect routes and attach user info
 */
export const protect = async (req, res, next) => {
  try {
    // 1️⃣ Get token from cookies
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // 2️⃣ Verify token
    let decoded;
    try {
      decoded = verifyToken(token); // { userId }
    } catch (err) {
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }

    // 3️⃣ Fetch user from DB
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    // 4️⃣ Attach user to request
    req.user = user;
    req.userId = user._id.toString();


    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error in auth middleware" });
  }
};

