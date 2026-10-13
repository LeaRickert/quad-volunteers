import { defineConfig } from "vitest/config";

export default defineConfig({
  // Resolves the `@/*` alias declared in tsconfig.json.
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/**/*.spec.ts"],
  },
});
