# `app/api/`

JSON API route handlers. Each `route.ts` exports one function per HTTP method (`GET`, `POST`, `PUT`). The interactive
reference is served at `/api/docs` from `public/openapi.json`; keep the two in sync (a unit test enforces it).

## Endpoints

| Method         | Path                             | Auth                                              | Calls                                 | Notes                                                 |
| -------------- | -------------------------------- | ------------------------------------------------- | ------------------------------------- | ----------------------------------------------------- |
| GET            | `/api/healthcheck`               | Public                                            | None                                  | Always `200`. No database.                            |
| GET            | `/api/trips/open`                | Public                                            | `getOpenTrips`                        | Trips with sign-ups open.                             |
| GET            | `/api/news/recent`               | Public                                            | `app/news/utils.ts`                   | Newest 3 posts.                                       |
| GET            | `/api/gear/hours`                | Public                                            | `getGearHours`                        | Gear officers' hours.                                 |
| GET            | `/api/leaderboard/led`           | Public                                            | `getMostTripsLed`                     | Top 5 by trips led.                                   |
| GET            | `/api/leaderboard/total`         | Public                                            | `getMostTripsAttended`                | Top 5 by trips attended.                              |
| GET            | `/api/docs`                      | Public                                            | Scalar                                | API reference UI (Scalar version pinned in the file). |
| GET            | `/api/azure-signout`             | Public                                            | None                                  | Redirects to Microsoft logout.                        |
| \*             | `/api/auth/*`                    | NextAuth                                          | `options.ts`                          | Sign-in callbacks. Do not add routes here.            |
| GET            | `/api/protected/user`            | Session                                           | `getMemberByEmail`                    | The signed-in member.                                 |
| GET            | `/api/protected/user/trips`      | Session                                           | `getTripsByMemberId`                  | Trips the signed-in member attended.                  |
| GET            | `/api/protected/membership`      | Session                                           | `verifyMembershipByEmail`             | Whether the session email is a member.                |
| GET            | `/api/protected/members`         | Session + any officer                             | `verifyMemberIsOfficer`, `getMembers` | Id, name, email of every member.                      |
| GET            | `/api/protected/memberdirectory` | Session + trip leader                             | `getTripLeader`, `getMemberDirectory` | Directory with trip-planning fields.                  |
| GET            | `/api/protected/memberexport`    | Session + `EXPORT_MEMBERS_AUTHORIZED_POSITIONS`   | `getMembers`                          | CSV download.                                         |
| GET, POST, PUT | `/api/protected/tripleaders`     | Session + `GET_TRIP_LEADERS_AUTHORIZED_POSITIONS` | trip leader miniservice               | List, create, update trip leaders.                    |
| POST           | `/api/automation/dues`           | `Authorization: Bearer DUES_API_KEY`              | `readReceipt`, `recordDuesByEmail`    | Called by the Power Automate Dues flow.               |

## Auth rules

- Everything under `protected/` requires a session, enforced by `proxy.ts`. Each route still calls
  `getServerSession(authOptions)` and returns `401` if there is none, so it is safe even if the matcher changes.
- Role lists live in `config/permissions.ts`. Add a new constant there rather than listing titles in the route.
- `automation/` must stay **outside** `protected/` and out of the `proxy.ts` matcher, otherwise Power Automate gets
  redirected to the sign-in page. It accepts only the API key, never a session.
- Public routes must not return private member fields (phone, medical, emergency contact).

## Conventions

- Wrap the handler body in `try/catch` and return a plain-text `500` on failure. Do not leak error details.
- Return `401` for no session, `403` for signed-in but not allowed, `404` when the member is missing.
- Routes that must not be cached at build time export `dynamic = "force-dynamic"` and `revalidate = 0`.
- Every auth and validation branch gets a unit test in `tests/unit/app/api/` (same path as the route).

How to add a route: [docs/runbooks.md](../../docs/runbooks.md#add-an-api-route).
