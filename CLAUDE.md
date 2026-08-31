# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**Navolt AB** — marinelektronik company website (Göteborg / Öckerö / Hälsö).
Next.js 15 App Router, Tailwind CSS, Framer Motion, Sanity CMS, Resend email.
Language: Swedish throughout — all user-facing copy is Swedish.

Rebranded from the `karlstad-redskap` CMS starter. Sibling project `Apegrenen`
is the same architecture, further along — look there first for reference
implementations (product detail page, cart, cookie consent, legal pages).

## Commands

```bash
npm run dev      # localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

## Architecture

### Styling
All design tokens are in the `:root` block at the top of `app/globals.css`.
That file is imported by `app/(site)/layout.tsx`, **not** the root layout —
it styles bare elements (`body`, `h1`–`h6`, `a`) and the Studio renders in the
same document, so loading it globally painted the Studio's own headings in
the site's near-black navy. Keep it inside the (site) group.
`tailwind.config.ts` maps them to utilities (`bg-surface`, `text-primary`,
`text-text-muted`, …). Change a hex there, not in components.

Palette is **Deep Sea & Brass**: navy `#12304A` primary, brass `#C08A3E`
accent (`--color-gold`, used sparingly for emphasis).

Component classes — `.btn-primary`, `.btn-outline`, `.btn-gold`, `.card`,
`.input`, `.section`, `.section-label`, `.section-title`, `.section-subtitle` —
are defined in `globals.css` under `@layer components`. Prefer them over
ad-hoc Tailwind.

### Fonts
`Open Sans` (headings, and the wordmark) and `Inter` (body) via
`next/font/google` in `app/layout.tsx`, exposed as `--font-heading` /
`--font-body`.

### Content sources — three layers
1. `config/site.ts` — company facts (name, phone, org.nr, social). Edit here first.
2. In-file `default*` / `fallback*` arrays — page copy shown when Sanity is empty.
3. Sanity documents — override both once populated.

Pages must render correctly with **no** Sanity project configured;
`sanity/client.ts` exports `isSanityConfigured` and every query short-circuits.

### CMS
Studio is embedded at `/studio` (`app/studio/[[...tool]]/page.tsx`), structure
defined in `sanity.config.ts`. Schemas in `sanity/schemas/`, GROQ in
`sanity/queries.ts`, image URLs via `sanity/imageUrl.ts`.

### Email
- `POST /api/contact` — contact form (**multipart**, it carries attachments)
- `POST /api/send` — single-product order form (JSON)

Both validate with zod and escape user input via the local `esc()` helper
before interpolating into the email HTML. Keep that escaping if you edit them.

### Contact form
`lib/contactForm.ts` is the single source of truth: the five subjects, the
follow-up questions each one reveals, and the upload limits. `ContactForm`
renders from it, `/api/contact` labels the email rows from it and drops any
answer that doesn't belong to the chosen subject. Add a question there, not in
either consumer.

Attachments cap at 5 files / 4 MB total — Vercel rejects a request body over
4.5 MB before the route ever runs, so the form checks the limit client-side to
turn that into a readable error. Both sides re-check; neither trusts the other.

`/tjanster` still links in as `/kontakt?amne=<tjänst>`; `prefillFromParam`
maps that onto a subject (Motorservice → Båt, with "Motor" ticked).

### Cookies / GDPR
`context/CookieConsentContext.tsx` holds the consent state (localStorage key
`navolt_cookie_consent`), `components/CookieBanner.tsx` is the banner plus its
settings dialog, and `CookieSettingsButton` reopens it from the footer.

Two categories only: **nödvändiga** (always on) and **externa tjänster**. The
second gates every Elfsight widget — `ElfsightWidget` returns a placeholder and
loads no third-party script until consent is given, which is the whole point.
Don't bypass it by mounting `platform.js` anywhere else, and don't advertise a
category (statistik, marknadsföring) the site doesn't actually use.

`/integritetspolicy` and `/cookies` are static, not Sanity-backed. The cookie
table lists what the site really stores — update it when that changes, and bump
`CONSENT_VERSION` when the categories do.

### Services, URLs and SEO
The old site was flat — `/bat`, `/motorservice`, `/campervan`, `/batrutor`,
`/galleri` — and those URLs carry its rankings. So **every service is a
top-level page**, not a child of `/tjanster`. `/tjanster` is the index above
them: one panel per service, each linking out with "Läs mer".

**One document, one template.** A `service` document is a whole page — slug,
brödtext, steg, utvald sektion, galleri, CTA and SEO — rendered by the single
route `app/(site)/[slug]/page.tsx`. There is no per-service route and no
per-service singleton; adding a service in the studio adds a page, a landing
tile, a `/tjanster` panel and a header menu entry, with no code change.

A section with nothing in it is left out rather than rendered empty (the
highlight band keys off its rubrik, steps and gallery off their arrays), so a
half-filled service still looks deliberate.

`lib/serviceContent.ts` is the placeholder layer: `defaultServices` (the four
segments, so /tjanster and the service pages stand up with no Sanity project)
and `defaultServicePages`, the longer copy keyed by slug. Only båtrutor has
the long set — it's the page the old site ranked on. All of it is
`PLACEHOLDER COPY` pending customer sign-off.

`lib/services.ts` decides the URL shape in one place — `serviceHref()`,
`hasServicePage()`, `RESERVED_SLUGS`, and `serviceForms` (the two Elfsight
booking forms, keyed by slug). The landing tiles, the `/tjanster` panels, the
header menu and the sitemap all route through it. Don't hardcode a service
path anywhere else.

`RESERVED_SLUGS` exists because service slugs are editor-controlled and land at
the root: a service slugged `produkter` would sit under a route that already
exists, so it keeps its `/tjanster` panel instead of advertising a link that
goes somewhere else. `[slug]` is also the top-level dynamic segment, so it
catches every unknown path — hence its `notFound()`.

`getContent()` in that route reconciles document → per-slug placeholder →
generic placeholder in one place, and `generateMetadata` reads the same
function, so the merge rules can't drift between the markup and the `<head>`.

The header's **Tjänster** item opens a mega-menu listing whatever services are
published. `app/(site)/layout.tsx` fetches them and passes `services` to
`Navigation`, so the header stays a client component that knows nothing about
Sanity — with none published it degrades to the plain link it always was. The
panel is a child of `motion.header`, positioned `left-0 right-0 top-full`, so
it is exactly as wide as the header at any moment: full-bleed at the top of the
page, pill-width once scrolled. Its radius and gap follow the same `shrunk`
flag the header's geometry does. The header owns the hover region — moving
between the label and the panel stays inside one element, which is why no
hover bridge is needed.

`next.config.ts` redirects the two old URLs that don't carry over: `/bat` →
`/marinelektronik` and `/galleri` → `/om-oss`. **The full list still needs
confirming against Search Console** — anything else with traffic belongs there
too.

`app/sitemap.ts` and `app/robots.ts` back this up; both hang off
`siteConfig.url` (override with `NEXT_PUBLIC_SITE_URL` on preview deploys).
The sitemap dedupes by URL, since `/batrutor` is listed among the static routes
as well as coming through as a service.

### Animation
`components/AnimatedSection.tsx` exports `AnimatedSection` (scroll fade/slide,
`delay` + `direction` props) and `StaggerContainer` / `StaggerItem`.
`components/PageTransition.tsx` wraps subpages.

Server components fetch and pass down; `'use client'` is limited to Navigation,
forms, animation wrappers, the product index shell, and everything that reads
cookie consent (`ElfsightWidget` included).

## Current state

- `/produkter` is live in the navigation (`components/Navigation.tsx` and
  `components/Footer.tsx`). The catalogue itself is only as full as Sanity —
  the page falls back to its in-file defaults while the dataset is empty.
- No product detail page or cart/order flow yet — deferred until products exist.
  Port from `Apegrenen` when needed.
- Copy marked `PLACEHOLDER COPY` awaits customer sign-off. Don't present it as
  final, and don't invent credentials, founding years or customer counts.
