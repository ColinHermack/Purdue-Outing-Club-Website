# `app/`

Next.js App Router. Every folder with a `page.tsx` is a URL, every folder under `api/` with a `route.ts` is an API
endpoint. See [docs/architecture.md](../docs/architecture.md) for how the pieces fit together.

## Shared files

| File            | Purpose                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| `layout.tsx`    | Root layout for every page: session provider, HeroUI and theme providers, navbar, footer, Vercel Analytics. |
| `providers.tsx` | HeroUI provider (wired to the Next.js router) and `next-themes` (follows the system color scheme).          |
| `error.tsx`     | Shown when a page throws.                                                                                   |
| `not-found.tsx` | 404 page.                                                                                                   |
| `favicon.ico`   | Browser tab icon.                                                                                           |

## Pages

"Server" pages run on the server and may call miniservices. "Client" pages have `"use client"` and get data from
`/api/...`. Pages marked **build** query the database at deploy time.

| URL                             | File                            | Kind          | Signed in?              | Data                                                   |
| ------------------------------- | ------------------------------- | ------------- | ----------------------- | ------------------------------------------------------ |
| `/`                             | `page.tsx`                      | Client        | No                      | `/api/news/recent`                                     |
| `/calendar`                     | `calendar/page.tsx`             | Server        | No                      | Google Calendar embed                                  |
| `/trips`                        | `trips/page.tsx`                | Client        | No                      | `/api/trips/open`                                      |
| `/trips/[id]`                   | `trips/[id]/page.tsx`           | Server, build | No                      | `getTripData`                                          |
| `/pleadership`                  | `pleadership/page.tsx`          | Server, build | No                      | `getLeaderData` (officers by branch)                   |
| `/faq`                          | `faq/page.tsx`                  | Client        | No                      | Static                                                 |
| `/gearcloset`                   | `gearcloset/page.tsx`           | Client        | No                      | `/api/gear/hours`                                      |
| `/climbingteam`                 | `climbingteam/page.tsx`         | Client        | No                      | Static                                                 |
| `/pocar`                        | `pocar/page.tsx`                | Client        | No                      | Static                                                 |
| `/supportus`                    | `supportus/page.tsx`            | Server, build | No                      | `getLeaderDataByPosition`                              |
| `/sponsorship`                  | `sponsorship/page.tsx`          | Server, build | No                      | `getLeaderDataByPosition`                              |
| `/diversity`                    | `diversity/page.tsx`            | Server, build | No                      | `getLeaderDataByPosition`                              |
| `/join`                         | `join/page.tsx`                 | Server        | No                      | Static (links to dues, forms, waiver)                  |
| `/drivers`                      | `drivers/page.tsx`              | Client        | No                      | Static                                                 |
| `/tripleaders`                  | `tripleaders/page.tsx`          | Client        | No                      | Static                                                 |
| `/safetyconcernreport`          | `safetyconcernreport/page.tsx`  | Server        | No                      | Static (links to a form)                               |
| `/constitution`                 | `constitution/page.tsx`         | Server        | No                      | Redirects to the constitution PDF                      |
| `/news`, `/news/[slug]`         | `news/`                         | Server        | No                      | `newsposts/*.mdx`                                      |
| `/auth/signin`, `/auth/signout` | `auth/`                         | Client        | No                      | NextAuth                                               |
| `/dashboard`                    | `dashboard/page.tsx`            | Client        | Yes                     | `/api/protected/user`, `/api/protected/user/trips`     |
| `/tripleadersdashboard`         | `tripleadersdashboard/page.tsx` | Client        | Yes, trip leader admins | `/api/protected/tripleaders`, `/api/protected/members` |
| `/memberdirectory`              | `memberdirectory/page.tsx`      | Client        | Yes, trip leaders       | `/api/protected/memberdirectory`                       |
| `/memberexport`                 | `memberexport/page.tsx`         | Server        | Yes, export roles       | `/api/protected/memberexport`                          |

"Signed in" pages must be listed in the `matcher` in `proxy.ts`; the role check itself happens in the API route.

## Conventions

- Page titles use `<title>` inside the page or `export const metadata`.
- Headings use the club amber: `text-5xl text-amber-400 font-bold`.
- Navbar and footer entries come from `config/site.ts`, not from the page.
- `news/utils.ts` and `news/postUtils.tsx` both read `newsposts/`. `utils.ts` is used by the API route;
  `postUtils.tsx` also renders the news lists.

API routes are described in [api/README.md](api/README.md).
