import type {
  Request,
  Response,
} from "express";

import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../services/auth.service.js";

import { prisma } from "../lib/prisma.js";

const REFRESH_COOKIE_NAME = "refreshToken";

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/auth",
};

function setRefreshCookie(
  res: Response,
  refreshToken: string,
) {
  res.cookie(
    REFRESH_COOKIE_NAME,
    refreshToken,
    {
      ...refreshCookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  );
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(
    REFRESH_COOKIE_NAME,
    refreshCookieOptions,
  );
}

export async function register(
  req: Request,
  res: Response,
) {
  try {
    const {
      name,
      email,
      password,
      gymName,
    } = req.body;

    const result = await registerUser(
      name,
      email,
      password,
      gymName,
    );

    setRefreshCookie(
      res,
      result.tokens.refreshToken,
    );

    return res.status(201).json({
      message: "Registration successful",
      user: result.user,
      gym: result.gym,
      accessToken: result.tokens.accessToken,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "EMAIL_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

export async function login(
  req: Request,
  res: Response,
) {
  try {
    const {
      email,
      password,
    } = req.body;

    const result = await loginUser(
      email,
      password,
    );

    setRefreshCookie(
      res,
      result.tokens.refreshToken,
    );

    return res.status(200).json({
      message: "Login successful",
      user: result.user,
      accessToken: result.tokens.accessToken,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_CREDENTIALS"
    ) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

export async function refresh(
  req: Request,
  res: Response,
) {
  try {
    const refreshToken =
      req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token missing",
      });
    }

    const tokens =
      await refreshAccessToken(refreshToken);

    setRefreshCookie(
      res,
      tokens.refreshToken,
    );

    return res.status(200).json({
      accessToken: tokens.accessToken,
    });
  } catch {
    clearRefreshCookie(res);

    return res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
}

export async function logout(
  req: Request,
  res: Response,
) {
  try {
    const refreshToken =
      req.cookies?.refreshToken;

    if (refreshToken) {
      await logoutUser(refreshToken);
    }

    clearRefreshCookie(res);

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error(error);

    clearRefreshCookie(res);

    return res.status(200).json({
      message: "Logout successful",
    });
  }
}

export async function me(
  req: Request,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,

        ownedGyms: {
          select: {
            id: true,
            name: true,
          },
        },

        memberships: {
          where: {
            status: "ACTIVE",
          },
          select: {
            gymId: true,
            status: true,
            gym: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}