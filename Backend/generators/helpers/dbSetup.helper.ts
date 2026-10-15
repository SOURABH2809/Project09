import path from "node:path";
import { runCommand } from "./runCLICommand.helper.ts";
import { createFile, createFolder } from "./create.helper.ts";

const folders = ["prisma", "config"];
export const setupDBForModule = (basePath: string, moduleName: string) => {
  console.log(`\n🚀 Running: DB Setup For ${moduleName}\n`);

  // Create all DB folders
  folders.forEach((folder) => {
    createFolder(path.join(basePath, folder));
  });

  // prisma schema
  createFile(
    path.join(basePath, "prisma", "schema.prisma"),
    `
  generator client {
  provider        = "prisma-client"
  output          = "../database/generated/prisma"
  }

  datasource db {
  provider = "postgresql"
  schemas  = ["${moduleName}"]
  }
`,
  );

  // prisma client file
  createFile(
    path.join(basePath, "config", "prisma.client.ts"),
    `
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../database/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export default prisma;
`,
  );

  // prisma schema
  createFile(
    path.join(basePath, "prisma.config.ts"),
    `
import "dotenv/config";
import { defineConfig } from "prisma/config";

const DATABASE_URL = process.env.DATABASE_URL;
const SCHEMA = "${moduleName}";

if (!DATABASE_URL) {
  throw new Error("Database URL not configured");
}

const url = DATABASE_URL + "?schema=" + SCHEMA;

export default defineConfig({
  datasource: {
    url: url,
  },
});
`,
  );

  // Generate Client
  runCommand(`npx prisma generate --schema=src/modules/${moduleName}/prisma/schema.prisma`);
};
