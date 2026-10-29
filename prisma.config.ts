import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // react-server: seed memakai src/lib/db.ts yang ditandai "server-only".
    seed: "tsx --conditions=react-server prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
