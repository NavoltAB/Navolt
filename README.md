# Navolt

Website for **Navolt AB** — marinelektronik in Göteborg / Öckerö.

Next.js 15 (App Router) · Tailwind CSS · Framer Motion · Sanity CMS · Resend. Language: Swedish.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev                        # http://localhost:3000
```

| Variable | Where to get it |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | sanity.io → create a project |
| `NEXT_PUBLIC_SANITY_DATASET` | usually `production` |
| `SANITY_API_READ_TOKEN` | only needed if the dataset is private |
| `RESEND_API_KEY` | resend.com |
| `RESEND_FROM_EMAIL` | must be on a domain verified in Resend |
| `CONTACT_EMAIL` | where contact/order mail lands |

The site renders without Sanity configured — every page falls back to the copy
in `config/site.ts` and the in-file defaults.

## Sanity Studio

Runs embedded at **`/studio`** once `NEXT_PUBLIC_SANITY_PROJECT_ID` is set.
Document types live in `sanity/schemas/`:

- `homePage`, `aboutPage`, `kontaktPage`, `siteSettings` — singletons
- `service` — the segments shown on the homepage and `/tjanster`
- `product`, `category` — the catalogue (see *Products* below)

## Design tokens

The entire palette, type scale and spacing live in one `:root` block at the top
of `app/globals.css`. `tailwind.config.ts` maps those CSS variables to utility
classes (`bg-surface`, `text-primary`, …), so changing a hex there restyles the
whole site.

Current palette: **Deep Sea & Brass** — deep navy primary (`#12304A`) with a
brass accent (`#C08A3E`).

## Products — not live yet

The customer has no catalogue yet, so `/produkter` is **deliberately absent from
the navigation**. The page, the `product`/`category` schemas and `ProductCard`
are all still in place — to switch it on, add the link back to `navLinks` in
`components/Navigation.tsx` and the footer list in `components/Footer.tsx`.

Still to build when the catalogue exists:

- `/produkter/[slug]` product detail page
- cart + basket-to-email order flow (`/api/send` already handles single-product
  orders and is wired for it)

## Copy status

Content marked with a `PLACEHOLDER COPY` comment needs the customer's sign-off
before launch — most importantly the four service segments in
`app/tjanster/page.tsx` and the story text in `app/om-oss/page.tsx`. Opening
hours in `config/site.ts` are a guess.
