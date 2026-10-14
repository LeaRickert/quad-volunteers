import {defineConfig} from "vitest/config";
import {fileURLToPath} from "node:url";

export default defineConfig({

  resolve: {
    // Resolves the `@/*` alias declared in tsconfig.json.
    tsconfigPaths: true,
    alias: {
      // `server-only` throws outside a Server Component; use an empty stub in tests.
      "server-only": fileURLToPath(
        new URL("./src/test/server-only.ts", import.meta.url),
      ),
    }
  },
  test: {
    environment: "node",
    include: ["src/**/*.spec.ts"],
  },
});
