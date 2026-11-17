# `models/`

Classes that describe one row of a database table, with camelCase field names. They document the tables in
TypeScript.

| File | Table |
| --- | --- |
| `member.ts` | `member` (with its JSON columns as nested classes) |
| `officer.ts` | `officer` |
| `trip.ts` | `trip` |
| `tripLeader.ts` | `trip_leader` |

Nothing imports these classes today: each miniservice declares a private `...Row` interface with the raw
`snake_case` columns and maps it straight to a DTO. Keep the models in step with the schema anyway (they are the
quickest way to read a table's shape), or switch the miniservices to use them.

The authoritative schema is `tests/integration/schema.sql`; column meanings are in
[docs/systems/database.md](../docs/systems/database.md).
