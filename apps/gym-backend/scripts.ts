import { prisma } from "./lib/prisma.js";

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@prisma.io",
      passwordHash: "sample-password-hash",
    },
  });
  console.log("Created user:", user);

  const allUsers = await prisma.user.findMany({
    include: {
      ownedGyms: true,
      memberships: true,
      refreshTokens: true,
    },
  });
  console.log("All users:", JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
