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
`Source Serif 4` (headings) and `Inter` (body) via `next/font/google` in
`app/layout.tsx`, exposed as `--font-heading` / `--font-body`.

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
- `POST /api/contact` — contact form
- `POST /api/send` — single-product order form

Both validate with zod and escape user input via the local `esc()` helper
before interpolating into the email HTML. Keep that escaping if you edit them.

### Animation
`components/AnimatedSection.tsx` exports `AnimatedSection` (scroll fade/slide,
`delay` + `direction` props) and `StaggerContainer` / `StaggerItem`.
`components/PageTransition.tsx` wraps subpages.

Server components fetch and pass down; `'use client'` is limited to Navigation,
forms, animation wrappers and FilterBar.

## Current state

- `/produkter` exists but is **not** in the navigation — the customer has no
  catalogue yet. Schemas and components are ready; re-add the nav links in
  `components/Navigation.tsx` and `components/Footer.tsx` to switch it on.
- No product detail page or cart/order flow yet — deferred until products exist.
  Port from `Apegrenen` when needed.
- Copy marked `PLACEHOLDER COPY` awaits customer sign-off. Don't present it as
  final, and don't invent credentials, founding years or customer counts.
