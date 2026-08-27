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

export interface ProductDocument {
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
  price?: number
  unit?: string
  inStock: boolean
  featured?: boolean
  shortDescription?: string
  description?: PortableTextBlock[]
  productDetails?: ProductDetail[]
  documents?: ProductDocument[]
  mainImage?: SanityImage
  // images[1], when the product has one — the card cross-fades to it on hover.
  hoverImage?: SanityImage
  images?: SanityImage[]
}

export interface Service {
  _id: string
  title: string
  slug?: string
  shortDescription?: string
  features?: string[]
  imageUrl?: string
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
