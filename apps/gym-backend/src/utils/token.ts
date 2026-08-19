import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { UserRole } from "@prisma/client";

interface AccessTokenPayload {
  sub: string;
  role: UserRole;
}

export function generateAccessToken(
  userId: string,
  role: UserRole,
) {
  return jwt.sign(
    {
      sub: userId,
      role,
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    },
  );
}

export function verifyAccessToken(token: string) {
  return jwt.verify(
    token,
    env.JWT_ACCESS_SECRET,
  ) as jwt.JwtPayload & AccessTokenPayload;
}

export function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

export function hashRefreshToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}