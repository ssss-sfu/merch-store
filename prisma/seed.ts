import { PrismaClient } from "@prisma/client";
import bycrypt from "bcrypt";
import { env } from "~/env.mjs";

const prisma = new PrismaClient();

async function main() {
  await createAdminUser();
  await createSizes();
}

async function createAdminUser() {
  const saltedRounds = 10;
  const hashedPassword = await bycrypt.hash(env.ADMIN_PASSWORD, saltedRounds);

  await prisma.user.create({
    data: {
      username: env.ADMIN_USERNAME,
      password: hashedPassword,
    },
  });
}

async function createSizes() {
  await prisma.productSize.createMany({
    data: [
      { size: "xxs" },
      { size: "xs" },
      { size: "s" },
      { size: "m" },
      { size: "l" },
      { size: "xl" },
      { size: "xxl" },
    ],
  });
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
