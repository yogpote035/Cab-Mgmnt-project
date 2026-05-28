import { ImapFlow } from "imapflow";
import { env } from "../config/env.js";
import { createBookingFromEmail } from "../services/emailParser.service.js";
import { logger } from "../utils/logger.js";

let isPolling = false;
let activeSession = null;
let activeClient = null;
const AUTO_SCAN_DAYS_BACK = 3;
const FAST_SCAN_INTERVAL_MS = 15 * 1000;
const BACKFILL_SCAN_INTERVAL_MS = 5 * 60 * 1000;
const MAX_MESSAGES_PER_POLL = 10;
const POLL_TIMEOUT_MS = 20 * 1000;

export function startEmailPolling() {
  if (!env.enableEmailPolling || !env.imap.host) return;

  setInterval(() => runPollSafely({ includeSeen: false, daysBack: AUTO_SCAN_DAYS_BACK }), FAST_SCAN_INTERVAL_MS);
  setInterval(() => runPollSafely({ includeSeen: true, daysBack: AUTO_SCAN_DAYS_BACK }), BACKFILL_SCAN_INTERVAL_MS);
  runPollSafely({ includeSeen: false, daysBack: AUTO_SCAN_DAYS_BACK });
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
  const session = { id: Date.now(), expired: false };
  activeSession = session;

  try {
    await Promise.race([
      pollInbox(options, session),
      expirePollingSession(session)
    ]);
  } catch (error) {
    if (error.code === "EPOLL_TIMEOUT") {
      logger.warn("Email polling session expired; next scheduler tick will start a fresh session", { timeoutMs: POLL_TIMEOUT_MS });
    } else {
      logger.warn("Email polling failed", { message: error.message, code: error.code });
    }
  } finally {
    if (activeSession?.id === session.id) {
      isPolling = false;
      activeSession = null;
      activeClient = null;
    }
  }
}

function expirePollingSession(session) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      session.expired = true;
      if (activeSession?.id === session.id) {
        logger.warn("Email polling session timed out; closing IMAP connection");
        try {
          activeClient?.close();
        } catch (error) {
          logger.warn("IMAP close failed", { message: error.message, code: error.code });
        }
      }

      const error = new Error("Email polling session timed out");
      error.code = "EPOLL_TIMEOUT";
      reject(error);
    }, POLL_TIMEOUT_MS);
  });
}

async function pollInbox({ includeSeen = false, daysBack = 7 } = {}, session) {
  const client = new ImapFlow({
    host: env.imap.host,
    port: env.imap.port,
    secure: true,
    auth: { user: env.imap.user, pass: env.imap.pass },
    logger: false,
    socketTimeout: 12000,
    connectionTimeout: 10000,
    greetingTimeout: 10000
  });
  activeClient = client;

  client.on("error", (error) => {
    logger.warn("IMAP connection error", { message: error.message, code: error.code });
  });

  let lock;

  try {
    if (session.expired) return;
    await client.connect();
    if (session.expired) return;
    lock = await client.getMailboxLock("INBOX");
    if (session.expired) return;

    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const searchQuery = includeSeen
      ? { since }
      : { seen: false };
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
      if (session.expired) break;
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
    if (lock) {
      try {
        lock.release();
      } catch (error) {
        logger.warn("IMAP lock release failed", { message: error.message, code: error.code });
      }
    }
    if (!client.usable) return;
    await client.logout().catch((error) => {
      logger.warn("IMAP logout failed", { message: error.message, code: error.code });
    });
  }
}
