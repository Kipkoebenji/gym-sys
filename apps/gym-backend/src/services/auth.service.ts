import { prisma } from "../../lib/prisma.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

import { createTokens } from "./token.service.js";

import { hashRefreshToken } from "../utils/token.js";

export async function registerUser(
  name: string,
  email: string,
  password: string,
  gymName: string,
) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await hashPassword(password);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "GYM_OWNER",
      },
    });

    const gym = await tx.gym.create({
      data: {
        name: gymName,
        ownerId: user.id,
      },
    });

    await tx.gymMember.create({
      data: {
        userId: user.id,
        gymId: gym.id,
      },
    });

    return {
      user,
      gym,
    };
  });

  const tokens = await createTokens(result.user.id, result.user.role);

  return {
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
    },
    gym: result.gym,
    tokens,
  };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordValid = await verifyPassword(user.passwordHash, password);

  if (!passwordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const tokens = await createTokens(user.id, user.role);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    tokens,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const tokenHash = hashRefreshToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });

  if (!storedToken) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  if (storedToken.revokedAt) {
    throw new Error("REFRESH_TOKEN_REVOKED");
  }

  if (storedToken.expiresAt < new Date()) {
    throw new Error("REFRESH_TOKEN_EXPIRED");
  }

  // Rotate the refresh token.
  await prisma.refreshToken.update({
    where: {
      id: storedToken.id,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  const tokens = await createTokens(storedToken.user.id, storedToken.user.role);

  return tokens;
}

export async function logoutUser(refreshToken: string) {
  const tokenHash = hashRefreshToken(refreshToken);

  await prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}
