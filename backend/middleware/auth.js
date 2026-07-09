import User from "../models/User.js";
import { verifyToken } from "../utils/jwt.js";

const roleHierarchy = {
  user: 0,
  admin: 1,
  super_admin: 2,
};

// Middleware to verify JWT token and protect routes
// Sets req.userId and req.user for use in route handlers
export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const payload = await verifyToken(token);
    // console.log("Payload:", payload);
    req.user = payload;
    next();
  } catch (err) {
    // Unknown error
    console.error("JWT verification error:", err);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// export const isAdmin = (req, res, next) => {
//   if (
//     !req.user ||
//     (req.user.role !== "admin" && req.user.role !== "super_admin")
//   ) {
//     return res
//       .status(403)
//       .json({ success: false, message: "Admin access required" });
//   }
//   next();
// };

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};

// Hierarchical check — "at least this level"
export const requireMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });
    const userLevel = roleHierarchy[req.user.role] ?? -1;
    const requiredLevel = roleHierarchy[minRole] ?? Infinity;
    if (userLevel < requiredLevel) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
