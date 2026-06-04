import User from "../models/User.js";
import { verifyToken, joseErrors } from "../lib/jwt.js";

/**
 * Extract Bearer token from Authorization header
 */
function extractBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7).trim();
}

/**
 * Middleware to verify JWT token and protect routes
 * Sets req.userId and req.user for use in route handlers
 */
export const authenticate = async (req, res, next) => {
  const token = extractBearerToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      code: "NO_TOKEN",
      message: "No token provided",
    });
  }

  try {
    const payload = await verifyToken(token);
    req.userId = payload.sub;
    req.tokenPayload = payload;
    next();
  } catch (err) {
    // Map jose errors to appropriate HTTP responses
    if (err instanceof joseErrors.JWTExpired) {
      return res.status(401).json({
        success: false,
        code: "TOKEN_EXPIRED",
        message: "Token has expired. Please refresh your token.",
      });
    }

    if (err instanceof joseErrors.JWTInvalid) {
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Token is invalid or malformed",
      });
    }

    if (err instanceof joseErrors.JWTClaimValidationFailed) {
      return res.status(403).json({
        success: false,
        code: "CLAIM_VALIDATION_FAILED",
        message: "Token claim validation failed",
        detail: err.claim,
      });
    }

    if (err instanceof joseErrors.JOSEAlgNotAllowed) {
      return res.status(401).json({
        success: false,
        code: "ALGORITHM_NOT_ALLOWED",
        message: "Token algorithm not allowed",
      });
    }

    // Unknown error
    console.error("JWT verification error:", err);
    return res.status(401).json({
      success: false,
      code: "AUTH_ERROR",
      message: "Authentication failed",
    });
  }
};
