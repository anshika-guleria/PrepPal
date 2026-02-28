import jwt from "jsonwebtoken";

// Generate JWT
export const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined in .env");
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Verify JWT (optional helper)
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
