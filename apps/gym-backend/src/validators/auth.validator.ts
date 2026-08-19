import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(100),

  email: z
    .string()
    .trim()
    .email()
    .transform((email) => email.toLowerCase()),

  password: z
    .string()
    .min(8)
    .max(100),

  gymName: z
    .string()
    .trim()
    .min(2)
    .max(150),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((email) => email.toLowerCase()),

  password: z
    .string()
    .min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});