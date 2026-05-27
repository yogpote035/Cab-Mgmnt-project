import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { startEmailPolling } from "./jobs/emailPoller.js";
import { logger } from "./utils/logger.js";

await connectDB();
app.listen(env.port, () => {
  logger.info(`API running on http://localhost:${env.port}`);
  startEmailPolling();
});
