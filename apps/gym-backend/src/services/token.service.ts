import { prisma } from "../../lib/prisma.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/token.js";
import { env } from "../config/env.js";
import type { UserRole } from "../../lib/prisma.js";

export async function createTokens(userId: string, role: UserRole) {
  const accessToken = generateAccessToken(userId, role);

  const refreshToken = generateRefreshToken();

  const tokenHash = hashRefreshToken(refreshToken);

  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRES_DAYS);

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken,
  };
}
