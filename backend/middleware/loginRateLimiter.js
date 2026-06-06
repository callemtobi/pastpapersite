import rateLimit from "express-rate-limit";

// export const loginRateLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // limit each IP to 5 requests per window
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     success: false,
//     message: "Too many login attempts. Please try again after 15 minutes.",
//   },
// });

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    const retryAfter = Math.ceil(
      (new Date(req.rateLimit.resetTime).getTime() - Date.now()) / 1000,
    );

    res.status(429).json({
      success: false,
      message: "Too many login attempts.",
      retryAfter: Math.max(retryAfter, 0),
      //   attemptsRemaining: req.rateLimit.remaining,
    });
  },
});
