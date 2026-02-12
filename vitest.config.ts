/// <reference types="vitest" />

import react from "@vitejs/plugin-react";

import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "./",
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/testing/setup-tests.ts",
    exclude: ["**/node_modules/**", "**/e2e/**"],
    coverage: {
      include: ["src/**"],
    },
  },
});
