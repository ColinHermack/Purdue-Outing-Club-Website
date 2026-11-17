# `components/`

React components shared by more than one page. Page-specific components stay next to their page (for example
`app/trips/[id]/tripDifficultyIcon.tsx`).

| File | Component | Used by |
| --- | --- | --- |
| `navbar.tsx` | `Navbar`: top bar with the logo, links from `config/site.ts`, and a Join button. Collapses to a menu on mobile. | `app/layout.tsx` |
| `footer.tsx` | `Footer`: footer links and social icons from `config/site.ts`. | `app/layout.tsx` |
| `AuthProvider.tsx` | `AuthProvider`: wraps the app in NextAuth's `SessionProvider` so client code can call `useSession`. | `app/layout.tsx` |
| `PageMessage.tsx` | `PageMessage`: centered title and message for "no access", "error", and "not signed in" states. | Protected pages, sign-in |
| `accordion-entry.tsx` | `AccordionEntry`: one collapsible question/answer item. | Home, FAQ, trip leaders, POCAR |
| `logos.tsx` | `Logo`, `LargeLogo`: the club logo. | Navbar, footer |
| `mdx.tsx` | `CustomMDX`: MDX renderer with styled headings, links, images, tables, code. | Not used yet. News posts are rendered with `remark-html` in `app/news/[slug]/page.tsx`. |

Use HeroUI v3 components (`@heroui/react`) as building blocks. The HeroUI docs at
<https://heroui.com/react/llms-full.txt> are the reference.
