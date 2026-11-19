# Outside systems overview

The repository only hosts website source code. This page shows every outside system the site depends on, what each one
does, and which account owns it. Each system has its own page with details.

```mermaid
flowchart TB
    subgraph Code["Code and deploys"]
        GH["GitHub repo<br/>ColinHermack/Purdue-Outing-Club-Website"]
        CI["GitHub Actions CI<br/>.github/workflows/ci.yml"]
        V["Vercel<br/>project outing-club-website-v2"]
    end
    subgraph MS["poc@purdue.edu Microsoft account"]
        AAD["Azure AD app registration<br/>(sign-in)"]
        PA["Power Automate flows"]
        MAIL["poc@purdue.edu mailbox"]
    end
    DNS["Squarespace<br/>purdueoutingclub.com"]
    DB[("PostgreSQL 14<br/>AWS Lightsail")]
    TC["TooCool store<br/>(dues payments)"]
    DS["DocuSign<br/>(club sports waiver)"]
    FORMS["Microsoft Forms<br/>(agreement, certifications, trips)"]
    GS["Google Sheets and Calendar<br/>(club Google account)"]
    OD["OneDrive / Excel<br/>(poc@purdue.edu)"]
    Visitors((Visitors))

    GH -->|pull request / push| CI
    GH -->|git integration| V
    DNS -->|DNS points at| V
    Visitors -->|www.purdueoutingclub.com| V
    V -->|DB_* env vars| DB
    V <-->|OAuth sign-in| AAD
    TC -->|receipt email| MAIL
    DS -->|signed waiver email| MAIL
    MAIL --> PA
    FORMS --> PA
    PA -->|POST /api/automation/dues| V
    PA -->|PostgreSQL connector| DB
    PA -->|rosters, member lists, trip events| GS
    PA -->|uploads, ETP PDFs, form copies| OD
```

## Systems at a glance

| System              | What it does for the site                                                                             | Owning account                                                                                      | Where its settings live                 | Details                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------- |
| GitHub              | Source code, pull requests, CI                                                                        | Personal account `ColinHermack` (see [handoff](../handoff.md))                                      | Repo settings, `.github/`, `CODEOWNERS` | [Runbooks](../runbooks.md)                                           |
| GitHub Actions      | Lint, typecheck, tests, build on every PR                                                             | Same as repo                                                                                        | `.github/workflows/ci.yml`              | [tests/README.md](../../tests/README.md#continuous-integration)      |
| Vercel              | Builds and hosts the site, preview deploys, logs, analytics                                           | Team `purdue-outing-clubs-projects`, owner is the club Gmail account                                | Vercel dashboard                        | [vercel.md](vercel.md)                                               |
| AWS Lightsail       | Hosts the PostgreSQL database                                                                         | AWS account tied to `poc@purdue.edu`                                                                | Lightsail console                       | [database.md](database.md)                                           |
| Azure AD (Entra ID) | Microsoft sign-in for members                                                                         | `poc@purdue.edu`                                                                                    | Azure Portal, App registrations         | [azure-ad.md](azure-ad.md)                                           |
| Power Automate      | Updates members, trips and shadow evaluations from emails and forms; mirrors views into Google Sheets | `poc@purdue.edu` (environment "Purdue Outing Club")                                                 | Power Automate portal                   | [power-automate.md](power-automate.md)                               |
| Squarespace         | Domain registration and DNS for `purdueoutingclub.com`                                                | Club Gmail account (`purdueouting@gmail.com`)                                                       | Squarespace Domains                     | [domain-and-links.md](domain-and-links.md)                           |
| TooCool             | Club store where members pay dues; sends receipt emails                                               | Purdue platform; the president and treasurer sign in with their Purdue accounts (organization 1231) | TooCool                                 | [power-automate.md](power-automate.md#dues---toocool)                |
| DocuSign            | Purdue club sports waiver; sends signed copies                                                        | The club's faculty advisor (only faculty and IT staff can create PowerForms)                        | PowerForm link in `app/join/page.tsx`   | [power-automate.md](power-automate.md#docusign---club-sports-waiver) |
| Microsoft Forms     | Info and policy agreement, first aid and driver certification, trip sign-up forms                     | `poc@purdue.edu`                                                                                    | Microsoft Forms                         | [power-automate.md](power-automate.md)                               |
| Google Calendar     | Embedded club calendar on `/calendar`; approved trips are added by a flow                             | Club Gmail account                                                                                  | Google Calendar                         | [domain-and-links.md](domain-and-links.md#links-and-embeds)          |
| Google Sheets       | Trip sign-up responses and nightly copies of member, leader, report and roster views                  | Google account used by the flows' Google connection                                                 | Google Drive                            | [power-automate.md](power-automate.md#google-sheet-mirrors)          |
| OneDrive and Excel  | Form file uploads, Extended Travel Packet PDFs, Excel copies of agreement responses                   | `poc@purdue.edu`                                                                                    | OneDrive                                | [power-automate.md](power-automate.md)                               |

## Accounts that unlock everything

Two accounts control almost every system above. Whoever maintains the site must have access to both:

- **`poc@purdue.edu`** (Microsoft): Azure AD app registration, Power Automate flows, the mailbox the flows read, and
  the AWS account for Lightsail.
- **The club Gmail account**: owner of the Vercel team, and the Google Calendar.

How to transfer these is in [handoff.md](../handoff.md).
