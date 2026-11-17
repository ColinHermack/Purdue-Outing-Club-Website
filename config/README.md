# `config/`

Settings that are not secrets and change rarely. Edit these instead of hard-coding values in pages.

| File | What it holds | Edit it when |
| --- | --- | --- |
| `site.ts` | Site name, description, `navItems` (navbar), `footerItems`, social `links`. | Adding a page to the navbar or footer, changing a footer form link. `tests/unit/config/site.test.ts` checks the links. |
| `permissions.ts` | Lists of officer position titles allowed to use each protected feature. | Giving a new position access. Titles must match `officer.position` exactly. |
| `constants.ts` | `BASE_URL`, sports, difficulty levels and descriptions, `LEADERSHIP_CATEGORIES` (which positions appear in which branch on `/pleadership`, in display order), sport descriptions. | Adding a sport, renaming or adding an officer position. |
| `types.ts` | Small shared types (`GearHoursDataT`). | Rarely. |
| `fonts.ts` | Google fonts loaded through `next/font`. | Changing the site font. |

Secrets and connection strings do **not** belong here. They are environment variables
([docs/systems/vercel.md](../docs/systems/vercel.md#environment-variables)).
