# Outside systems overview

The repository is only part of the website. This page shows every outside system the site depends on, what each one
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
    FORMS["Microsoft Forms<br/>(info and policy agreement)"]
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
```

## Systems at a glance

| System | What it does for the site | Owning account | Where its settings live | Details |
| --- | --- | --- | --- | --- |
| GitHub | Source code, pull requests, CI | Personal account `ColinHermack` (see [handoff](../handoff.md)) | Repo settings, `.github/`, `CODEOWNERS` | [Runbooks](../runbooks.md) |
| GitHub Actions | Lint, typecheck, tests, build on every PR | Same as repo | `.github/workflows/ci.yml` | [tests/README.md](../../tests/README.md#continuous-integration) |
| Vercel | Builds and hosts the site, preview deploys, logs, analytics | Team `purdue-outing-clubs-projects`, owner is the club Gmail account | Vercel dashboard | [vercel.md](vercel.md) |
| AWS Lightsail | Hosts the PostgreSQL database | AWS account tied to `poc@purdue.edu` | Lightsail console | [database.md](database.md) |
| Azure AD (Entra ID) | Microsoft sign-in for members | `poc@purdue.edu` | Azure Portal, App registrations | [azure-ad.md](azure-ad.md) |
| Power Automate | Updates dues, waivers, and policy agreements from emails and forms | `poc@purdue.edu` | Power Automate portal | [power-automate.md](power-automate.md) |
| Squarespace | Domain registration and DNS for `purdueoutingclub.com` | TODO(handoff): which account owns the Squarespace domain | Squarespace Domains | [domain-and-links.md](domain-and-links.md) |
| TooCool | Club store where members pay dues; sends receipt emails | TODO(handoff): which officer account manages the TooCool store (organization 1231) | TooCool | [power-automate.md](power-automate.md#dues---toocool) |
| DocuSign | Purdue club sports waiver; sends signed copies | TODO(handoff): confirm (Purdue Rec and Wellness owns the PowerForm?) | PowerForm link in `app/join/page.tsx` | [power-automate.md](power-automate.md#docusign---club-sports-waiver) |
| Microsoft Forms | Info and policy agreement form, trip sign-up forms | `poc@purdue.edu` (TODO(handoff): confirm for trip sign-up forms) | Microsoft Forms | [power-automate.md](power-automate.md) |
| Google Calendar | Embedded club calendar on `/calendar` | Club Gmail account | Google Calendar | [domain-and-links.md](domain-and-links.md#links-and-embeds) |

## Accounts that unlock everything

Two accounts control almost every system above. Whoever maintains the site must have access to both:

- **`poc@purdue.edu`** (Microsoft): Azure AD app registration, Power Automate flows, the mailbox the flows read, and
  the AWS account for Lightsail.
- **The club Gmail account**: owner of the Vercel team, and the Google Calendar.

How to transfer these is in [handoff.md](../handoff.md).
