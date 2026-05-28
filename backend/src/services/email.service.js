import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { EmailLog } from "../models/EmailLog.js";
import { ApiError } from "../utils/apiError.js";

export function mailer() {
  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000
  });
}

export async function sendInvoiceEmail(invoice, pdfPath) {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) {
    throw new Error("SMTP is not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env");
  }

  const transport = mailer();
  try {
    const info = await transport.sendMail({
      from: env.smtp.from,
      to: invoice.clientEmail,
      subject: `Invoice ${invoice.invoiceNumber}`,
      text: `Please find attached invoice ${invoice.invoiceNumber}. Outstanding balance: ${invoice.balanceAmount}.`,
      attachments: [{ filename: `${invoice.invoiceNumber}.pdf`, path: pdfPath }]
    });
    await EmailLog.create({ direction: "Outgoing", to: invoice.clientEmail, subject: `Invoice ${invoice.invoiceNumber}`, status: "Sent", relatedInvoice: invoice._id, messageId: info.messageId });
    return info;
  } catch (error) {
    await EmailLog.create({
      direction: "Outgoing",
      to: invoice.clientEmail,
      subject: `Invoice ${invoice.invoiceNumber}`,
      status: "Failed",
      relatedInvoice: invoice._id,
      error: error.message
    });

    if (isSmtpConnectionTimeout(error)) {
      throw new ApiError(502, "SMTP connection timed out from production server", {
        code: error.code,
        host: env.smtp.host,
        port: env.smtp.port,
        hint: "If this is Render Free, outbound SMTP ports 25, 465, and 587 are blocked. Use a paid instance or an email provider/API that supports port 2525/HTTPS."
      });
    }

    throw error;
  }
}

function isSmtpConnectionTimeout(error) {
  return ["ETIMEDOUT", "ESOCKET", "ECONNECTION"].includes(error.code) || /conn/i.test(error.command || "") || /timeout/i.test(error.message || "");
}
