import cron from "node-cron";
import User from "../models/User.js";

export const cleanupUnverifiedUsers = async () => {
  try {
    const result = await User.deleteMany({
      isVerified: false,
      //   createdAt: { $lt: new Date(Date.now() - 60 * 60 * 1000) }, // Older than 1 hour
      //   createdAt: { $lt: new Date(Date.now() - 60 * 1000) }, // Older than 1 minute
    });

    if (result.deletedCount > 0) {
      console.log(
        `🧹 [CRON] Cleaned up ${result.deletedCount} expired unverified user(s) at ${new Date().toISOString()}`,
      );
    }
  } catch (error) {
    console.error("❌ [CRON] Cleanup failed:", error.message);
  }
};

export const startCleanupCron = () => {
  // Runs every 30 minutes
  cron.schedule("*/30 * * * *", async () => {
    console.log("⏰ [CRON] Running unverified user cleanup...");
    await cleanupUnverifiedUsers();
  });

  console.log("✅ [CRON] Unverified user cleanup job scheduled.");
};

export default { startCleanupCron, cleanupUnverifiedUsers };

/*
┌──────── minute (0 - 59)
│   ┌────── hour (0 - 23)
│   │   ┌──── day of month (1 - 31)
│   │   │   ┌── month (1 - 12)
│   │   │   │   ┌ day of week (0 - 7)
│   │   │   │   │
You can add a sixth field for seconds
Every 10 seconds --> cron.schedule("ESTERICK  /10 * * * * *", async () => {

Every minute --> cron.schedule("* * * * *", async () => {
*/
