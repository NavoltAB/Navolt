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

export interface ProductDetail {
  label: string
  value: string
}

export interface Product {
  _id: string
  name: string
  slug: string
  category?: Category
  price?: number
  unit?: string
  inStock: boolean
  featured?: boolean
  shortDescription?: string
  description?: PortableTextBlock[]
  productDetails?: ProductDetail[]
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

export interface HomePage {
  heroTitle?: string
  heroSubtitle?: string
  heroImageUrl?: string
  featuredProducts?: Product[]
  aboutTitle?: string
  aboutText?: string
  aboutImageUrl?: string
}

export interface AboutPage {
  pageSubtitle?: string
  mainImageUrl?: string
  storyText?: string
  stats?: { value: string; label: string }[]
  values?: { title: string; text: string }[]
  ctaTitle?: string
  ctaText?: string
}

export interface KontaktPage {
  pageLabel?: string
  pageTitle?: string
  pageSubtitle?: string
  contactInfoTitle?: string
  formTitle?: string
  freeConsultationTitle?: string
  freeConsultationText?: string
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
  children: { _type: string; _key: string; text: string; marks: string[] }[]
  markDefs: unknown[]
  style: string
}
