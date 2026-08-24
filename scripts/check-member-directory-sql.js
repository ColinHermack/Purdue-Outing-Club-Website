// Runs the exact SQL from getMemberDirectory() and checks its derived columns against the
// all_members view. Fails loudly if any count disagrees.
const fs = require("fs");
const { Pool } = require("pg");

fs.readFileSync(".env", "utf8")
  .split("\n")
  .forEach((line) => {
    const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);

    if (match) {
      process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
    }
  });

// Pulled verbatim out of miniservices/memberMiniService.ts so a drift there shows up here.
const source = fs.readFileSync("miniservices/memberMiniService.ts", "utf8");
const sql = source
  .split("export async function getMemberDirectory")[1]
  .split("`")[1]
  .replace(/;\s*$/, "");

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  const mine = await pool.query(`
    SELECT count(*)::int AS total,
      count(*) FILTER (WHERE is_active)::int AS active,
      count(first_aid_type)::int AS first_aid,
      count(*) FILTER (WHERE driver_certified)::int AS drivers,
      count(*) FILTER (WHERE dues_status = 'paid')::int AS dues_paid,
      count(*) FILTER (WHERE dues_status NOT IN ('paid', 'expired', 'none'))::int AS bad_dues,
      count(*) FILTER (WHERE is_active IS NULL OR driver_certified IS NULL OR car_hitch IS NULL)::int AS nulls
    FROM (${sql}) q`);

  const view = await pool.query(`
    SELECT count(*)::int AS total,
      count(*) FILTER (WHERE "Active" LIKE 'Yes%')::int AS active,
      count("First Aid")::int AS first_aid,
      count("Driver")::int AS drivers
    FROM all_members`);

  const a = mine.rows[0];
  const b = view.rows[0];

  console.log("directory query:", a);
  console.log("all_members view:", b);

  const problems = [];

  if (a.total !== b.total) problems.push(`total ${a.total} != ${b.total}`);
  if (a.active !== b.active) problems.push(`active ${a.active} != ${b.active}`);
  if (a.first_aid !== b.first_aid)
    problems.push(`first aid ${a.first_aid} != ${b.first_aid}`);
  if (a.drivers !== b.drivers)
    problems.push(`drivers ${a.drivers} != ${b.drivers}`);
  if (a.bad_dues !== 0) problems.push(`${a.bad_dues} rows with unknown dues status`);
  if (a.nulls !== 0) problems.push(`${a.nulls} rows with a null boolean`);
  if (a.dues_paid < a.active)
    problems.push(`dues_paid ${a.dues_paid} < active ${a.active}`);

  await pool.end();

  if (problems.length > 0) {
    console.error("FAIL:", problems.join("; "));
    process.exit(1);
  }

  console.log("OK: directory query agrees with the all_members view");
})();
