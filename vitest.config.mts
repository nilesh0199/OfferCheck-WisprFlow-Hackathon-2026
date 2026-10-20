import { defineConfig } from "vitest/config";
import path from "node:path";

const isLive = process.argv.some((arg) => arg.includes("tests-live"));

export default defineConfig({
  test: {
    environment: "node",
    include: isLive ? ["tests-live/**/*.test.ts"] : ["tests/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
