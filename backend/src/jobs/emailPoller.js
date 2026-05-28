import { ImapFlow } from "imapflow";
import { env } from "../config/env.js";
import { createBookingFromEmail } from "../services/emailParser.service.js";
import { logger } from "../utils/logger.js";

let isPolling = false;

export function startEmailPolling() {
  if (!env.enableEmailPolling || !env.imap.host) return;
  setInterval(runPollSafely, 60 * 1000);
  runPollSafely();
}

export async function scanInboxNow() {
  await runPollSafely({ includeSeen: true, daysBack: 30 });
}

async function runPollSafely(options = {}) {
  if (isPolling) {
    logger.info("Email polling skipped because a previous poll is still running");
    return;
  }

  isPolling = true;
  try {
    await pollInbox(options);
  } catch (error) {
    logger.warn("Email polling failed", { message: error.message, code: error.code });
  } finally {
    isPolling = false;
  }
}

async function pollInbox({ includeSeen = false, daysBack = 7 } = {}) {
  const client = new ImapFlow({
    host: env.imap.host,
    port: env.imap.port,
    secure: true,
    auth: { user: env.imap.user, pass: env.imap.pass },
    logger: false,
    socketTimeout: 120000,
    connectionTimeout: 30000,
    greetingTimeout: 30000
  });

  client.on("error", (error) => {
    logger.warn("IMAP connection error", { message: error.message, code: error.code });
  });

  let lock;
  try {
    await client.connect();
    lock = await client.getMailboxLock("INBOX");

    const range = includeSeen
      ? { since: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000) }
      : { seen: false };

    for await (const msg of client.fetch(range, { envelope: true, source: true, uid: true })) {
      const text = msg.source.toString();
      const booking = await createBookingFromEmail({
        messageId: msg.envelope.messageId || String(msg.uid),
        from: msg.envelope.from?.[0]?.address,
        subject: msg.envelope.subject,
        text
      });
      if (!includeSeen) await client.messageFlagsAdd(msg.uid, ["\\Seen"], { uid: true });
      logger.info(booking ? "Booking email parsed" : "Email ignored by booking parser", {
        subject: msg.envelope.subject,
        messageId: msg.envelope.messageId || String(msg.uid)
      });
    }
  } finally {
    if (lock) lock.release();
    if (!client.usable) return;
    await client.logout().catch((error) => {
      logger.warn("IMAP logout failed", { message: error.message, code: error.code });
    });
  }
}
