import { ImapFlow } from "imapflow";
import { env } from "../config/env.js";
import { createBookingFromEmail } from "../services/emailParser.service.js";
import { logger } from "../utils/logger.js";

let isPolling = false;
const AUTO_SCAN_DAYS_BACK = 3;
const MAX_MESSAGES_PER_POLL = 25;
const POLL_TIMEOUT_MS = 55 * 1000;

export function startEmailPolling() {
  if (!env.enableEmailPolling || !env.imap.host) return;
  setInterval(() => runPollSafely({ includeSeen: true, daysBack: AUTO_SCAN_DAYS_BACK }), 60 * 1000);
  runPollSafely({ includeSeen: true, daysBack: AUTO_SCAN_DAYS_BACK });
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
    socketTimeout: 45000,
    connectionTimeout: 30000,
    greetingTimeout: 30000
  });

  client.on("error", (error) => {
    logger.warn("IMAP connection error", { message: error.message, code: error.code });
  });

  let lock;
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    logger.warn("Email polling session timed out; closing IMAP connection");
    client.close();
  }, POLL_TIMEOUT_MS);

  try {
    await client.connect();
    lock = await client.getMailboxLock("INBOX");

    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const searchQuery = includeSeen
      ? { since }
      : { or: [{ seen: false }, { since }] };
    const foundUids = await client.search(searchQuery, { uid: true });
    const uids = [...new Set(foundUids || [])].sort((a, b) => a - b).slice(-MAX_MESSAGES_PER_POLL);

    logger.info("Email polling started", {
      includeSeen,
      daysBack,
      found: foundUids?.length || 0,
      processing: uids.length
    });

    if (!uids.length) return;

    for await (const msg of client.fetch(uids, { envelope: true, source: true, flags: true, uid: true }, { uid: true })) {
      if (timedOut) break;
      const text = msg.source.toString();
      const result = await createBookingFromEmail({
        messageId: msg.envelope.messageId || String(msg.uid),
        from: msg.envelope.from?.[0]?.address,
        subject: msg.envelope.subject,
        text
      });

      if (result.status === "Parsed" || result.status === "Duplicate") {
        await client.messageFlagsAdd(msg.uid, ["\\Seen"], { uid: true });
      }

      logger.info(`Email scan result: ${result.status}`, {
        subject: msg.envelope.subject,
        messageId: msg.envelope.messageId || String(msg.uid),
        bookingId: result.booking?.bookingId,
        duplicateReason: result.duplicateReason
      });
    }
  } finally {
    clearTimeout(timeout);
    if (lock) lock.release();
    if (!client.usable) return;
    await client.logout().catch((error) => {
      logger.warn("IMAP logout failed", { message: error.message, code: error.code });
    });
  }
}
