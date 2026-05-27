import { scanInboxNow } from "../jobs/emailPoller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const scanInbox = asyncHandler(async (_req, res) => {
  await scanInboxNow();
  res.json({ message: "Inbox scan completed" });
});
