import { ImapFlow } from "imapflow";
import { env } from "../config/env.js";
import { createBookingFromEmail } from "../services/emailParser.service.js";
import { logger } from "../utils/logger.js";

export function startEmailPolling() {
  if (!env.enableEmailPolling || !env.imap.host) return;
  setInterval(pollInbox, 5 * 60 * 1000);
  pollInbox().catch((error) => logger.error(error.message));
}

async function pollInbox() {
  const client = new ImapFlow({
    host: env.imap.host,
    port: env.imap.port,
    secure: true,
    auth: { user: env.imap.user, pass: env.imap.pass }
  });
  await client.connect();
  const lock = await client.getMailboxLock("INBOX");
  try {
    for await (const msg of client.fetch({ seen: false }, { envelope: true, source: true, uid: true })) {
      const text = msg.source.toString();
      await createBookingFromEmail({
        messageId: msg.envelope.messageId || String(msg.uid),
        from: msg.envelope.from?.[0]?.address,
        subject: msg.envelope.subject,
        text
      });
      await client.messageFlagsAdd(msg.uid, ["\\Seen"], { uid: true });
    }
  } finally {
    lock.release();
    await client.logout();
  }
}
