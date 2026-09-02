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
  /** True when this product sits in a category marked "Kräver monteringspaket". */
  requiresKit?: boolean
  /** The one kit this specific ruta needs. Kits themselves never have one. */
  mountingKit?: Product | null
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
 * A service, and the page it renders at its own top-level URL.
 *
 * The first six fields are what the listings need and what getAllServices
 * projects. Everything below them belongs to the service's own page and is
 * only fetched by getServiceBySlug — no point shipping a step list to the
 * landing page's tiles.
 */
export interface Service {
  _id: string
  title: string
  slug?: string
  shortDescription?: string
  features?: (ServiceFeature | string)[]
  imageUrl?: string

  introLabel?: string
  introTitle?: string
  description?: PortableTextBlock[]

  stepsLabel?: string
  stepsTitle?: string
  steps?: ServiceStep[]

  highlightImageUrl?: string
  highlightLabel?: string
  highlightTitle?: string
  highlightText?: string
  highlightCtaLabel?: string
  highlightCtaHref?: string

  gallery?: ServicePhoto[]
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

  servicesLabel?: string
  servicesTitle?: string
  servicesCtaLabel?: string

  whyLabel?: string
  whyTitle?: string
  whyItems?: { title?: string; text?: string }[]

  aboutLabel?: string
  aboutTitle?: string
  aboutText?: string
  aboutImageUrl?: string
  aboutStats?: StatItem[]
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
