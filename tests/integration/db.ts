/**
 * Helpers for the integration test database (docker-compose.test.yml).
 *
 * @author Colin Hermack
 */

import fs from "fs";
import path from "path";

import { Client } from "pg";

const TABLES =
  "member, officer, trip_leader, trip, trip_roster, gear, gear_out";

/**
 * Opens a client to the test database. Throws unless DB_HOST is local, since callers wipe tables.
 */
export async function connectTestDb(): Promise<Client> {
  const host = process.env.DB_HOST;

  if (host !== "localhost" && host !== "127.0.0.1") {
    throw new Error(
      `Refusing to run integration tests against DB_HOST=${host}`,
    );
  }

  const client = new Client({
    host,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  return client;
}

/**
 * Runs a SQL file from this directory.
 */
export async function runSqlFile(client: Client, file: string): Promise<void> {
  await client.query(fs.readFileSync(path.join(__dirname, file), "utf8"));
}

/**
 * Empties every table and reloads seed.sql. Call in beforeEach for tests that write.
 */
export async function resetDb(): Promise<void> {
  const client = await connectTestDb();

  try {
    await client.query(`TRUNCATE ${TABLES} RESTART IDENTITY CASCADE`);
    await runSqlFile(client, "seed.sql");
  } finally {
    await client.end();
  }
}
