import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cab_management_erp",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || "15m",
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || "7d",
  gstPercent: Number(process.env.GST_PERCENT || 18),
  enableEmailPolling: process.env.ENABLE_EMAIL_POLLING === "true",
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || "Cab ERP <no-reply@example.com>"
  },
  imap: {
    host: process.env.IMAP_HOST,
    port: Number(process.env.IMAP_PORT || 993),
    user: process.env.IMAP_USER,
    pass: process.env.IMAP_PASS
  }
};
