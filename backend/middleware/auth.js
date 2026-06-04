import User from "../models/User.js";
import { verifyToken } from "../utils/jwt.js";

/**
 * Middleware to verify JWT token and protect routes
 * Sets req.userId and req.user for use in route handlers
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    console.log("Token:", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const payload = await verifyToken(token);
    console.log("Payload:", payload);
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
