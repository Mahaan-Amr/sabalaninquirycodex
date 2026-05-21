/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRawUnsafe(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'Product'",
  );

  if (!Array.isArray(tables) || tables.length === 0) {
    return;
  }

  const columns = await prisma.$queryRawUnsafe("PRAGMA table_info('Product')");
  const hasRowNumber = Array.isArray(columns)
    ? columns.some((column) => column.name === "rowNumber")
    : false;

  if (!hasRowNumber) {
    await prisma.$executeRawUnsafe('ALTER TABLE "Product" ADD COLUMN "rowNumber" TEXT');
  }

  await prisma.$executeRawUnsafe(
    'UPDATE "Product" SET "rowNumber" = "id" WHERE "rowNumber" IS NULL OR TRIM("rowNumber") = \'\'',
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
