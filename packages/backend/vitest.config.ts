import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true, // stellt sicher, dass Funktionen test, expect, describe... automatisch verfügbar sind
    },
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
  },
});
