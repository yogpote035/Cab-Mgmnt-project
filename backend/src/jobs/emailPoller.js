import { ImapFlow } from "imapflow";
import { env } from "../config/env.js";
import { createBookingFromEmail } from "../services/emailParser.service.js";
import { logger } from "../utils/logger.js";

const RECONNECT_DELAY_MS = 5 * 1000;
const MAX_MESSAGES_PER_BATCH = 25;

export function startInstantEmailScanner() {
  if (!env.enableEmailPolling || !env.imap.host) return;
  void runInstantScannerLoop();
}

export async function scanInboxNow() {
  const client = createImapClient();

  try {
    await client.connect();
    const result = await processUnreadEmails(client);
    await client.logout();
    return result;
  } catch (error) {
    client.close();
    throw error;
  }
}

async function runInstantScannerLoop() {
  while (true) {
    const client = createImapClient();

    client.on("error", (error) => {
      logger.warn("IMAP connection error", { message: error.message, code: error.code });
    });

    try {
      await client.connect();
      logger.info("Instant email scanner connected; waiting for new inbox mail");

      while (client.usable) {
        await processUnreadEmails(client);
        await client.idle();
      }
    } catch (error) {
      logger.warn("Instant email scanner disconnected", { message: error.message, code: error.code });
    } finally {
      await logoutSafely(client);
      logger.info("Restarting instant email scanner after reconnect delay", { delayMs: RECONNECT_DELAY_MS });
      await delay(RECONNECT_DELAY_MS);
    }
  }
}

function createImapClient() {
  return new ImapFlow({
    host: env.imap.host,
    port: env.imap.port,
    secure: true,
    auth: { user: env.imap.user, pass: env.imap.pass },
    logger: false,
    socketTimeout: 2 * 60 * 1000,
    connectionTimeout: 30000,
    greetingTimeout: 30000
  });
}

async function processUnreadEmails(client) {
  let lock;
  let parsed = 0;
  let duplicates = 0;
  let ignored = 0;

  try {
    lock = await client.getMailboxLock("INBOX");
    const foundUids = await client.search({ seen: false }, { uid: true });
    const uids = [...new Set(foundUids || [])].sort((a, b) => a - b).slice(0, MAX_MESSAGES_PER_BATCH);

    if (!uids.length) return { parsed, duplicates, ignored, processed: 0 };

    logger.info("Unread email scan started", { found: foundUids.length, processing: uids.length });

    for await (const msg of client.fetch(uids, { envelope: true, source: true, uid: true }, { uid: true })) {
      const result = await createBookingFromEmail({
        messageId: msg.envelope.messageId || String(msg.uid),
        from: msg.envelope.from?.[0]?.address,
        subject: msg.envelope.subject,
        text: msg.source.toString()
      });

      if (result.status === "Parsed" || result.status === "Duplicate") {
        await client.messageFlagsAdd(msg.uid, ["\\Seen"], { uid: true });
      }

      if (result.status === "Parsed") parsed += 1;
      if (result.status === "Duplicate") duplicates += 1;
      if (result.status === "Ignored") ignored += 1;

      logger.info(`Email scan result: ${result.status}`, {
        subject: msg.envelope.subject,
        messageId: msg.envelope.messageId || String(msg.uid),
        bookingId: result.booking?.bookingId,
        duplicateReason: result.duplicateReason
      });
    }

    return { parsed, duplicates, ignored, processed: uids.length };
  } finally {
    if (lock) {
      try {
        lock.release();
      } catch (error) {
        logger.warn("IMAP lock release failed", { message: error.message, code: error.code });
      }
    }
  }
}

async function logoutSafely(client) {
  if (!client.usable) return;
  await client.logout().catch((error) => {
    logger.warn("IMAP logout failed", { message: error.message, code: error.code });
    client.close();
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
