import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAccessToken(user) {
  return jwt.sign({ sub: user._id, role: user.role, name: user.name }, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpires });
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user._id, tokenVersion: user.tokenVersion || 0 }, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpires });
}
