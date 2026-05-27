import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export async function connectDB() {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(env.mongoUri);
    logger.info(`MongoDB connected: ${mongoose.connection.name}`);
  } catch (error) {
    const safeMongoUri = String(env.mongoUri || "MONGODB_URI_NOT_SET")
      .replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");

    logger.error("MongoDB connection failed", {
      message: error.message,
      mongoUri: safeMongoUri
    });

    throw new Error(
      "MongoDB connection failed. Start local MongoDB on 127.0.0.1:27017 or update backend/.env MONGODB_URI to your MongoDB Atlas connection string."
    );
  }
}
