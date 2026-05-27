import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signAccessToken, signRefreshToken } from "../utils/tokens.js";
import { env } from "../config/env.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) throw new ApiError(401, "Invalid email or password");
  if (!user.isActive) throw new ApiError(403, "User account is inactive");
  user.lastLoginAt = new Date();
  await user.save();
  res.json({ user: sanitize(user), accessToken: signAccessToken(user), refreshToken: signRefreshToken(user) });
});

export const refresh = asyncHandler(async (req, res) => {
  const payload = jwt.verify(req.body.refreshToken, env.jwtRefreshSecret);
  const user = await User.findById(payload.sub);
  if (!user || user.tokenVersion !== payload.tokenVersion) throw new ApiError(401, "Invalid refresh token");
  res.json({ accessToken: signAccessToken(user), refreshToken: signRefreshToken(user) });
});

export const me = asyncHandler(async (req, res) => res.json({ user: sanitize(req.user) }));

export const logout = asyncHandler(async (req, res) => {
  req.user.tokenVersion += 1;
  await req.user.save();
  res.json({ message: "Logged out" });
});

export const updateProfile = asyncHandler(async (req, res) => {
  req.user.name = req.body.name ?? req.user.name;
  req.user.phone = req.body.phone ?? req.user.phone;
  req.user.avatarUrl = req.body.avatarUrl ?? req.user.avatarUrl;
  await req.user.save();
  res.json({ user: sanitize(req.user) });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(req.body.currentPassword))) throw new ApiError(400, "Current password is incorrect");
  user.password = req.body.newPassword;
  user.tokenVersion += 1;
  await user.save();
  res.json({ message: "Password changed. Please login again." });
});

function sanitize(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatarUrl: user.avatarUrl };
}
