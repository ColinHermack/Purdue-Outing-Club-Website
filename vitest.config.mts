import path from "path";

import { defineConfig } from "vitest/config";

const alias = { "@": path.resolve(import.meta.dirname) };

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
          environment: "node",
          mockReset: true,
        },
      },
      {
        resolve: { alias },
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          environment: "node",
          mockReset: true,
          fileParallelism: false,
          globalSetup: "tests/integration/globalSetup.ts",
          // Hard-coded to the docker-compose.test.yml database. Never point this at a real DB:
          // the integration suite truncates every table.
          env: {
            DB_HOST: "localhost",
            DB_PORT: "5433",
            DB_USER: "postgres",
            DB_DATABASE: "poc_test",
          },
        },
      },
    ],
  },
});
