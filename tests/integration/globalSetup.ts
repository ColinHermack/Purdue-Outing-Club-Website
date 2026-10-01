/**
 * Runs once before the integration suite: rebuilds the public schema from schema.sql and seeds it.
 *
 * @author Colin Hermack
 */

import type { TestProject } from "vitest/node";

import { connectTestDb, resetDb, runSqlFile } from "./db";

export default async function setup(project: TestProject): Promise<void> {
  // globalSetup runs outside the test workers, so the project's `env` has to be applied by hand.
  Object.assign(process.env, project.config.env);

  const client = await connectTestDb();

  try {
    await client.query("DROP SCHEMA IF EXISTS public CASCADE");
    await runSqlFile(client, "schema.sql");
  } finally {
    await client.end();
  }

  await resetDb();
}
