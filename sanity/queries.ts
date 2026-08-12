import { client, isSanityConfigured } from './client'
import type {
  Product,
  Category,
  Service,
  Brand,
  HomePage,
  AboutPage,
  KontaktPage,
  ProductsPage,
  TjansterPage,
  SiteSettings,
} from '@/types/sanity'

const opts60 = { next: { revalidate: 60 } }
const opts300 = { next: { revalidate: 300 } }

const productFields = `
  _id,
  name,
  "slug": slug.current,
  "category": category->{ _id, title, "slug": slug.current },
  price,
  unit,
  inStock,
  shortDescription,
  "mainImage": images[0],
  "hoverImage": images[1]
`

export async function getAllCategories(): Promise<Category[]> {
  if (!isSanityConfigured) return []
  return client.fetch(
    `*[_type == "category"] | order(title asc) { _id, title, "slug": slug.current }`,
    {},
    opts300
  )
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (!isSanityConfigured) return []
  return client.fetch(
    `*[_type == "product" && featured == true] | order(_createdAt desc)[0...4] { ${productFields} }`,
    {},
    opts60
  )
}

// Landing page row. Featured first, then newest, capped at four — one query
// rather than "featured, else fall back to all", so the section still fills
// sensibly before anyone has thought to tick the featured box.
export async function getLandingProducts(): Promise<Product[]> {
  if (!isSanityConfigured) return []
  return client.fetch(
    `*[_type == "product"] | order(featured desc, _createdAt desc)[0...4] { ${productFields} }`,
    {},
    opts60
  )
}

export async function getAllProducts(): Promise<Product[]> {
  if (!isSanityConfigured) return []
  return client.fetch(
    `*[_type == "product"] | order(name asc) { ${productFields} }`,
    {},
    opts60
  )
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSanityConfigured) return null
  return client.fetch(
    `*[_type == "product" && slug.current == $slug][0] {
      _id,
      name,
      "slug": slug.current,
      "category": category->{ _id, title, "slug": slug.current },
      price,
      unit,
      inStock,
      shortDescription,
      description,
      productDetails,
      images
    }`,
    { slug },
    opts60
  )
}

/**
 * The row under a product detail page. Same category first, then anything else
 * to top the row up — a one-product category would otherwise render a heading
 * over an empty strip. The product being viewed is always excluded.
 */
export async function getRelatedProducts(
  slug: string,
  categorySlug: string | null
): Promise<Product[]> {
  if (!isSanityConfigured) return []
  return client.fetch(
    `*[_type == "product" && slug.current != $slug]
      | order(select(category->slug.current == $categorySlug => 0, 1) asc, featured desc, name asc)
      [0...4] { ${productFields} }`,
    { slug, categorySlug },
    opts60
  )
}

export async function getAllProductSlugs(): Promise<{ slug: string }[]> {
  if (!isSanityConfigured) return []
  return client.fetch(`*[_type == "product"] { "slug": slug.current }`, {}, opts60)
}

export async function getAllServices(): Promise<Service[]> {
  if (!isSanityConfigured) return []
  return client.fetch(
    `*[_type == "service"] | order(order asc) {
      _id,
      title,
      "slug": slug.current,
      shortDescription,
      features,
      "imageUrl": image.asset->url
    }`,
    {},
    opts60
  )
}

// Returns the raw image object rather than asset->url so the component can cap
// the width via urlFor() — a logo never needs more than a few hundred pixels.
// Brands without a logo are skipped; a half-filled document shouldn't render.
export async function getAllBrands(): Promise<Brand[]> {
  if (!isSanityConfigured) return []
  return client.fetch(
    `*[_type == "brand" && defined(logo.asset)] | order(order asc, name asc) {
      _id,
      name,
      logo,
      scale
    }`,
    {},
    opts300
  )
}

export async function getHomePage(): Promise<HomePage | null> {
  if (!isSanityConfigured) return null
  return client.fetch(
    // Projected field by field rather than fetched whole, so a schema change
    // can't quietly start shipping unused document weight to every visitor.
    `*[_type == "homePage"][0] {
      heroBadge,
      heroTitle,
      heroTitleAccent,
      heroSubtitle,
      "heroImageUrl": heroImage.asset->url,
      heroCtaLabel,
      heroPhoneLabel,
      trustStats[]{ value, label },
      productsLabel,
      productsTitle,
      productsCtaLabel,
      manifestoBefore,
      manifestoAccent,
      manifestoAfter,
      servicesLabel,
      servicesTitle,
      servicesCtaLabel,
      whyLabel,
      whyTitle,
      whyItems[]{ title, text },
      aboutLabel,
      aboutTitle,
      aboutText,
      "aboutImageUrl": aboutImage.asset->url,
      aboutStats[]{ value, label },
      aboutCtaLabel,
      reviewsLabel,
      ctaLabel,
      ctaTitle,
      ctaTitleAccent,
      ctaText,
      ctaPrimaryLabel,
      ctaSecondaryLabel,
      ctaPhoneLabel
    }`,
    {},
    opts60
  )
}

export async function getAboutPage(): Promise<AboutPage | null> {
  if (!isSanityConfigured) return null
  return client.fetch(
    `*[_type == "aboutPage"][0] {
      pageLabel,
      pageTitle,
      pageSubtitle,
      "mainImageUrl": mainImage.asset->url,
      storyLabel,
      storyText,
      storyCtaLabel,
      stats[]{ value, label },
      valuesLabel,
      valuesTitle,
      values[]{ title, text },
      instagramLabel,
      instagramTitle,
      ctaTitle,
      ctaText,
      ctaPrimaryLabel,
      ctaSecondaryLabel
    }`,
    {},
    opts300
  )
}

export async function getKontaktPage(): Promise<KontaktPage | null> {
  if (!isSanityConfigured) return null
  return client.fetch(
    `*[_type == "kontaktPage"][0] {
      pageLabel,
      pageTitle,
      pageSubtitle,
      contactInfoTitle,
      openingHoursTitle,
      freeConsultationTitle,
      freeConsultationText,
      formTitle
    }`,
    {},
    opts300
  )
}

export async function getTjansterPage(): Promise<TjansterPage | null> {
  if (!isSanityConfigured) return null
  return client.fetch(
    `*[_type == "tjansterPage"][0] {
      pageLabel,
      pageTitle,
      pageSubtitle,
      serviceCtaPrefix,
      ctaLabel,
      ctaTitle,
      ctaText,
      ctaButtonLabel
    }`,
    {},
    opts300
  )
}

export async function getProductsPage(): Promise<ProductsPage | null> {
  if (!isSanityConfigured) return null
  return client.fetch(
    `*[_type == "productsPage"][0] {
      pageLabel,
      pageTitle,
      pageSubtitle,
      ctaLabel,
      ctaTitle,
      ctaText,
      ctaButtonLabel
    }`,
    {},
    opts300
  )
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  if (!isSanityConfigured) return null
  return client.fetch(`*[_type == "siteSettings"][0]`, {}, opts300)
}
