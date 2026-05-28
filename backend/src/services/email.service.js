import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { EmailLog } from "../models/EmailLog.js";

export function mailer() {
  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
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
  const info = await transport.sendMail({
    from: env.smtp.from,
    to: invoice.clientEmail,
    subject: `Invoice ${invoice.invoiceNumber}`,
    text: `Please find attached invoice ${invoice.invoiceNumber}. Outstanding balance: ${invoice.balanceAmount}.`,
    attachments: [{ filename: `${invoice.invoiceNumber}.pdf`, path: pdfPath }]
  });
  await EmailLog.create({ direction: "Outgoing", to: invoice.clientEmail, subject: `Invoice ${invoice.invoiceNumber}`, status: "Sent", relatedInvoice: invoice._id, messageId: info.messageId });
  return info;
}
