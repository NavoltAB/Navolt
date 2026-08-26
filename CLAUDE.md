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
