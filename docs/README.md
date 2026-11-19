# Documentation

Guides for maintaining the Purdue Outing Club website. Start with the root [README](../README.md) to get the site
running, then read the guide that matches what you are doing.

| Guide                                                      | Read it when                                                                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [architecture.md](architecture.md)                         | You want to understand how a request flows through the code, how sign-in works, or where to put new code.    |
| [systems/overview.md](systems/overview.md)                 | You want the big picture of every outside system the site depends on and who owns each one.                  |
| [systems/vercel.md](systems/vercel.md)                     | You are deploying, rolling back, reading production logs, or changing environment variables.                 |
| [systems/database.md](systems/database.md)                 | You need to know what a table or column means, who writes it, or how to connect to the database.             |
| [systems/power-automate.md](systems/power-automate.md)     | Dues, waivers, or policy agreements stopped updating, or you are changing a `member` column.                 |
| [systems/azure-ad.md](systems/azure-ad.md)                 | Sign-in is broken, or the Microsoft client secret is about to expire.                                        |
| [systems/domain-and-links.md](systems/domain-and-links.md) | The domain needs renewing, DNS changed, or a form/calendar/store link on the site needs updating.            |
| [runbooks.md](runbooks.md)                                 | You have a specific task: add a page, add an API route, post news, rotate a secret, handle officer turnover. |
| [handoff.md](handoff.md)                                   | You are taking over (or handing over) ownership of the site and its accounts.                                |

Each folder in the repo also has a short `README.md` describing what lives there (for example
[miniservices/README.md](../miniservices/README.md) and [tests/README.md](../tests/README.md)).

## About `docs/plans/`

[plans/](plans/) holds the design plans written before each larger change (dues endpoint, member directory, testing,
and so on). They explain _why_ things were built the way they were, which is useful history, but they are **not kept
up to date**. When a plan and the code or these guides disagree, trust the code and these guides.

## Keeping these docs current

- Change a doc in the same pull request as the code it describes.
- Each fact should live in one place. Link to it instead of copying it.
- Lines marked `TODO(handoff):` are facts nobody has confirmed yet. Fill them in when you learn the answer.
