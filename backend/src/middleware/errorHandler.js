import { logger } from "../utils/logger.js";

export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  logger.error(error.message, { stack: error.stack, details: error.details });
  res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error",
    details: error.details
  });
}
