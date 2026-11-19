# Domain, DNS, and outside links

## Domain

`purdueoutingclub.com` is registered at **Squarespace** (Squarespace Domains, which took over Google Domains).
The domain is owned by the club Gmail account (`purdueouting@gmail.com`), the same account that owns the Vercel team.
**Auto-renew is off, and the domain expires on 27 March 2027.** Renew it (or turn on auto-renew) in Squarespace
Domains before then, or the whole site and Microsoft sign-in go offline.

DNS is managed in Squarespace and points at Vercel. Vercel serves `www.purdueoutingclub.com` and redirects the apex
`purdueoutingclub.com` to it with a 308. The DNS records Vercel expects are shown in Vercel under
**Project > Settings > Domains**; if a domain there shows "Invalid Configuration", copy the records it lists into
Squarespace's DNS settings.

If the domain ever lapses the whole site goes offline, and Microsoft sign-in breaks too because its redirect URI uses
the domain ([azure-ad.md](azure-ad.md)).

## Links and embeds

Much of the site links out to forms and services. When an officer sends you a new form link, this table tells you
which file to edit. Each change is a normal pull request.

| What                                                                                                                                                          | File                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Navbar and footer links (merch store, alumni site, reimbursement form, social links)                                                                          | `config/site.ts`                   |
| Pay dues (TooCool), dues waiver form, info and policy agreement form, club sports waiver (DocuSign), Slack invite, first aid certification form, mailing list | `app/join/page.tsx`                |
| Driver certification (SambaSafety enrollment, driver form)                                                                                                    | `app/drivers/page.tsx`             |
| Trip sign-up form (Microsoft Forms, pre-filled with trip id and sport)                                                                                        | `app/trips/[id]/page.tsx`          |
| Club calendar (Google Calendar embed of the club Gmail calendar)                                                                                              | `app/calendar/page.tsx`            |
| Trip leader Google Classroom and trip leader application form                                                                                                 | `app/tripleaders/page.tsx`         |
| Climbing team links                                                                                                                                           | `app/climbingteam/page.tsx`        |
| POCAR race info, IMLeagues, videos                                                                                                                            | `app/pocar/page.tsx`               |
| Safety concern report form                                                                                                                                    | `app/safetyconcernreport/page.tsx` |
| Donation and giving links, Linktree                                                                                                                           | `app/supportus/page.tsx`           |
| Sponsor links, REI list                                                                                                                                       | `app/sponsorship/page.tsx`         |
| Gear closet video                                                                                                                                             | `app/gearcloset/page.tsx`          |
| Home page video                                                                                                                                               | `app/page.tsx`                     |
| PDFs (constitution, EAP, POCAR rules, trip leader overview...)                                                                                                | files in `public/docs/`            |

The trip sign-up link in `app/trips/[id]/page.tsx` passes the trip id and sport into specific question ids of the
Microsoft Form (`r603986e...` and `r919debb...`). If that form is rebuilt, those ids change and the pre-fill stops
working.
