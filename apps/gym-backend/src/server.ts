import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "../lib/prisma.js";

async function startServer() {
  try {
    await prisma.$connect();

    console.log("Database connected");

    app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);

    process.exit(1);
  }
}

startServer();
