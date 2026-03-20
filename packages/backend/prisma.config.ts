// Load .env from this package root so `prisma db push` works no matter the shell cwd
// (Problem before: dotenv/config only loads .env from process.cwd(); running from repo
// root left DATABASE_URL unset or pointed at wrong DB → auth errors or empty DB.)
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname);
dotenv.config({ path: path.join(backendRoot, ".env") });

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
	},
	datasource: {
		url: process.env["DATABASE_URL"],
	},
});
