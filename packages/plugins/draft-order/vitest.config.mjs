import { defineConfig } from "vitest/config"

// Pagly: the admin's unit tests. Without a config here vitest picks up one
// from a parent directory. `.mjs` keeps it out of the plugin's tsc build.
export default defineConfig({
  test: {
    include: ["src/admin/**/__tests__/**/*.spec.{ts,tsx}"],
    setupFiles: ["src/admin/__tests__/setup.ts"],
  },
})
