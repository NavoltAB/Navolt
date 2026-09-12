export interface SanityImage {
  _type: 'image'
  asset: { _ref: string; _type: 'reference' }
  alt?: string
  hotspot?: { x: number; y: number; height: number; width: number }
}

export interface Category {
  _id: string
  title: string
  slug: string
}

export interface BoatModel {
  _id: string
  name: string
  slug: string
  order?: number
}

export interface ProductDetail {
  label: string
  value: string
}

/**
 * An uploaded file — a monteringsanvisning, datablad or mall. Hangs off both
 * products and services, hence the neutral name.
 */
export interface SanityFile {
  title?: string
  url?: string
  filename?: string
  /** Lowercase, no dot — "pdf", "dwg". Used for the chip on the download row. */
  ext?: string
  size?: number
}

export interface Product {
  _id: string
  // Sanity's own creation timestamp, projected so /produkter can offer a
  // "Nyast" sort without the editor having to maintain a date field.
  _createdAt?: string
  name: string
  slug: string
  category?: Category
  boatModel?: BoatModel
  /** The one kit this specific ruta needs. Kits themselves never have one. */
  mountingKit?: Product | null
  /** The reverse: every product that points at this one as its monteringspaket. */
  fitsProducts?: Product[]
  price?: number
  unit?: string
  inStock: boolean
  featured?: boolean
  shortDescription?: string
  description?: PortableTextBlock[]
  productDetails?: ProductDetail[]
  documents?: SanityFile[]
  mainImage?: SanityImage
  // images[1], when the product has one — the card cross-fades to it on hover.
  hoverImage?: SanityImage
  images?: SanityImage[]
}

/** One numbered step in the "Så går det till" row on a service page. */
export interface ServiceStep {
  title: string
  text?: string
}

/** One photo in a service page's gallery. */
export interface ServicePhoto {
  url: string
  alt?: string
}

/**
 * One "Vad ingår" bullet: a line of text and the icon shown in front of it.
 *
 * Documents written before the icon field existed store the bullet as a bare
 * string, so the array is typed as the union and every consumer runs it
 * through `normalizeFeatures` (lib/featureIcons.ts) rather than reading it
 * straight — a page must not go blank because a document hasn't been migrated.
 * The studio can't edit those old bullets (Sanity allows no string member
 * beside the object one), so run `npm run migrate:features` to convert them.
 */
export interface ServiceFeature {
  text: string
  icon?: string
}

/**
 * A category heading standing among the bullets.
 *
 * The cards stay one flat array, in the order the editor drags them; a heading
 * is simply another member of it, and every bullet after it belongs to that
 * category until the next heading. That keeps the studio to a single list —
 * no nested arrays to reorder — and leaves every document written before
 * categories existed rendering exactly as it did: one unheaded group.
 *
 * `_type` is what tells the two apart, so the fallback data spells it out
 * (lib/serviceContent.ts) rather than leaving it to Sanity to supply.
 */
export interface ServiceFeatureHeading {
  _type: 'featureGroup'
  title: string
}

/** A "Vad ingår" member: a bullet, a category heading, or a legacy string. */
export type ServiceFeatureItem = ServiceFeature | ServiceFeatureHeading | string

/**
 * A service, and the page it renders at its own top-level URL.
 *
 * The first seven fields are what the listings need and what getAllServices
 * projects. Everything below them belongs to the service's own page and is
 * only fetched by getServiceBySlug — no point shipping a step list to the
 * landing page's tiles.
 */
/**
 * One "utvald sektion" — the wide image-and-text band on a service page.
 *
 * A service can have several: båtrutor runs one for monteringspaketen and one
 * for rutpaketen. `items` is the punktlista; where an editor has typed the
 * list into `text` instead, `normalizeHighlight()` picks it apart — see
 * lib/highlights.ts.
 */
export interface ServiceHighlight {
  imageUrl?: string
  label?: string
  title?: string
  text?: string
  items?: string[]
  ctaLabel?: string
  ctaHref?: string
}

export interface Service {
  _id: string
  title: string
  slug?: string
  shortDescription?: string
  features?: ServiceFeatureItem[]
  imageUrl?: string
  /** Optional wide crop, for the 16:9 bands the tile image is cut badly in. */
  pageImageUrl?: string

  featuresLabel?: string
  /** The eyebrow above the h1 on the service's own page. Defaults to "Tjänst". */
  pageLabel?: string
  introLabel?: string
  introTitle?: string
  description?: PortableTextBlock[]

  stepsLabel?: string
  stepsTitle?: string
  steps?: ServiceStep[]

  highlights?: ServiceHighlight[]

  /** As pasted in the studio — parse with parseYouTubeId() before use. */
  videoUrl?: string
  videoLabel?: string
  videoTitle?: string
  videoPosterUrl?: string

  gallery?: ServicePhoto[]

  documentsLabel?: string
  documentsTitle?: string
  documentsText?: string
  documents?: SanityFile[]

  ctaLabel?: string
  ctaTitle?: string
  ctaText?: string
  ctaButtonLabel?: string

  seoTitle?: string
  seoDescription?: string
}

export interface Brand {
  _id: string
  name: string
  logo: SanityImage
  scale?: number
}

export interface StatItem {
  value?: string
  label?: string
}

export interface Campaign {
  _id: string
  title: string
  titleAccent?: string
  label?: string
  text?: string
  badge?: string
  imageUrl?: string
  ctaLabel?: string
  ctaHref?: string
  startDate?: string
  endDate?: string
  order?: number
}

export interface HomePage {
  heroBadge?: string
  heroTitle?: string
  heroTitleAccent?: string
  heroSubtitle?: string
  heroImageUrl?: string
  heroCtaLabel?: string
  heroPhoneLabel?: string

  trustStats?: StatItem[]

  productsLabel?: string
  productsTitle?: string
  productsCtaLabel?: string

  manifestoBefore?: string
  manifestoAccent?: string
  manifestoAfter?: string
  manifestoAccentEnd?: string
  manifestoAfterEnd?: string

  servicesLabel?: string
  servicesTitle?: string
  servicesCtaLabel?: string

  whyLabel?: string
  whyTitle?: string
  whyText?: string

  aboutLabel?: string
  aboutTitle?: string
  aboutText?: string
  aboutImageUrl?: string
  aboutCtaLabel?: string

  reviewsLabel?: string

  ctaLabel?: string
  ctaTitle?: string
  ctaTitleAccent?: string
  ctaText?: string
  ctaPrimaryLabel?: string
  ctaSecondaryLabel?: string
  ctaPhoneLabel?: string
}

export interface AboutPage {
  pageLabel?: string
  pageTitle?: string
  pageSubtitle?: string

  mainImageUrl?: string
  storyLabel?: string
  storyText?: string
  storyCtaLabel?: string

  stats?: StatItem[]

  valuesLabel?: string
  valuesTitle?: string
  values?: { title?: string; text?: string }[]

  videoUrl?: string
  videoLabel?: string
  videoText?: string
  videoPosterUrl?: string

  reviewsLabel?: string

  instagramLabel?: string
  instagramTitle?: string

  ctaTitle?: string
  ctaText?: string
  ctaPrimaryLabel?: string
  ctaSecondaryLabel?: string
}

export interface KontaktPage {
  pageLabel?: string
  pageTitle?: string
  pageSubtitle?: string
  contactInfoTitle?: string
  openingHoursTitle?: string
  freeConsultationTitle?: string
  freeConsultationText?: string
  formTitle?: string
}

export interface TjansterPage {
  pageLabel?: string
  pageTitle?: string
  pageSubtitle?: string
  serviceCtaPrefix?: string
  ctaLabel?: string
  ctaTitle?: string
  ctaText?: string
  ctaButtonLabel?: string
}

export interface ProductsPage {
  pageLabel?: string
  pageTitle?: string
  pageSubtitle?: string
  ctaLabel?: string
  ctaTitle?: string
  ctaText?: string
  ctaButtonLabel?: string
}

export interface SiteSettings {
  phone?: string
  email?: string
  address?: string
  openingHours?: string
  instagram?: string
  facebook?: string
  orgNumber?: string
  mapsUrl?: string
}

export interface PortableTextBlock {
  _type: string
  _key: string
  children: { _type: string; _key: string; text: string; marks?: string[] }[]
  markDefs?: unknown[]
  style?: string
  /** Present only on list rows — 'bullet' or 'number'. */
  listItem?: string
  level?: number
}
