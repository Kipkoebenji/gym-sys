import type { UserRole } from "../../lib/prisma.js";

declare global {
  namespace Express {
    interface User {
      id: string;
      role: UserRole;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
