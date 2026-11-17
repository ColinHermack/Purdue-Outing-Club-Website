# `public/`

Files served as-is from the site root: `public/poc_logo.png` is `https://www.purdueoutingclub.com/poc_logo.png`.

| Path | Contents |
| --- | --- |
| `leadership/` | Officer headshots, `first_last.jpg`. Referenced by `officer.officer_data.ImagePath`. Added with `scripts/fetch_poc_photos.py`. |
| `climbingteam/` | Photos for `/climbingteam`. |
| `sponsors/` | Sponsor logos for `/sponsorship`. |
| `docs/` | PDFs linked from the site (constitution, EAP, POCAR rules and instructions, trip leader overview, fundraising). Replace a PDF by keeping the same file name, or update every link to it. |
| `openapi.json` | OpenAPI spec for every `app/api` route, shown at `/api/docs`. Must match the routes (`tests/unit/openapi.test.ts`). |
| `*.png`, `*.jpg` | Images used by individual pages (home page, join steps, driver instructions, receipt example). |

Compress large photos before committing (the homepage images were compressed in commit `2fc0486`). Never put member
data or anything private here: everything in `public/` is downloadable by anyone.
