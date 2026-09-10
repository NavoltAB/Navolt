import { client, isSanityConfigured } from './client'
import type {
  Product,
  Category,
  Service,
  Brand,
  BoatModel,
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
  _createdAt,
  name,
  "slug": slug.current,
  "category": category->{ _id, title, "slug": slug.current },
  "boatModel": boatModel->{ _id, name, "slug": slug.current },
  price,
  unit,
  inStock,
  featured,
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

// Every model in Sanity, not only the ones already sitting on a product — the
// filter counts each option against the catalogue itself, and a model that
// vanished from the list the moment its last product went out of stock would
// read as a bug to whoever just created it. `order` first so the common boats
// can be pinned to the top, then name, so untouched models still land
// alphabetically rather than arbitrarily.
export async function getAllBoatModels(): Promise<BoatModel[]> {
  if (!isSanityConfigured) return []
  return client.fetch(
    `*[_type == "boatModel"] | order(order asc, name asc) { _id, name, "slug": slug.current, order }`,
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
      "boatModel": boatModel->{ _id, name, "slug": slug.current },
      "mountingKit": mountingKit->{ ${productFields} },
      // The other end of the same relation, so a monteringspaket page can say
      // which rutor it belongs to. A reverse lookup rather than a second field
      // for the editor to keep in sync: it is always exactly the set of
      // products pointing here, and it stays right when a ruta is repointed or
      // deleted. Usually one ruta, but a kit shared by two hulls lists both.
      "fitsProducts": *[_type == "product" && mountingKit._ref == ^._id]
        | order(name asc) { ${productFields} },
      price,
      unit,
      inStock,
      shortDescription,
      description,
      productDetails,
      documentsLabel,
      documentsTitle,
      documentsText,
      "documents": documents[defined(asset)]{
        title,
        "url": asset->url,
        "filename": asset->originalFilename,
        "ext": asset->extension,
        "size": asset->size
      },
      images
    }`,
    { slug },
    opts60
  )
}

/**
 * The four products under "Mer i sortimentet" on a product page.
 *
 * Båtmodell before kategori, deliberately. Someone reading a ruta for a Maxi 68
 * is shopping for that boat, not for rutor in general — the monteringspaket and
 * the verktyg that fit the same hull are the useful next click, and they sit in
 * other categories. Same category is the fallback when the model runs out (or
 * when the product has no model at all), and the rest of the catalogue fills
 * the row after that, so the section never renders half empty.
 *
 * Both tests are guarded with `defined()`: without it a null parameter matches
 * every product that *also* has nothing there, since null == null in GROQ, and
 * a product with no båtmodell would pull in every other product with no
 * båtmodell as its closest relative.
 */
export async function getRelatedProducts(
  slug: string,
  categorySlug: string | null,
  boatModelSlug: string | null = null
): Promise<Product[]> {
  if (!isSanityConfigured) return []
  return client.fetch(
    `*[_type == "product" && slug.current != $slug]
      | order(
          select(defined($boatModelSlug) && boatModel->slug.current == $boatModelSlug => 0, 1) asc,
          select(defined($categorySlug) && category->slug.current == $categorySlug => 0, 1) asc,
          featured desc,
          name asc
        )
      [0...4] { ${productFields} }`,
    { slug, categorySlug, boatModelSlug },
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
      "imageUrl": image.asset->url,
      "pageImageUrl": pageImage.asset->url
    }`,
    {},
    opts60
  )
}

/**
 * One service, for a service that has a page of its own (see lib/services.ts).
 *
 * Same fields as the overview query — the dedicated page renders the same
 * content, only larger — so a båtrutor panel edited in the studio changes both
 * /tjanster and /batrutor at once.
 */
export async function getServiceBySlug(slug: string): Promise<Service | null> {
  if (!isSanityConfigured) return null
  return client.fetch(
    `*[_type == "service" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      shortDescription,
      features,
      featuresLabel,
      pageLabel,
      "imageUrl": image.asset->url,
      "pageImageUrl": pageImage.asset->url,
      introLabel,
      introTitle,
      description,
      stepsLabel,
      stepsTitle,
      steps[defined(title)]{ title, text },
      highlights[defined(title)]{
        "imageUrl": image.asset->url,
        label,
        title,
        text,
        items,
        ctaLabel,
        ctaHref
      },
      videoUrl,
      videoLabel,
      videoTitle,
      "videoPosterUrl": videoPoster.asset->url,
      gallery[defined(asset)]{ "url": asset->url, alt },
      "documents": documents[defined(asset)]{
        title,
        "url": asset->url,
        "filename": asset->originalFilename,
        "ext": asset->extension,
        "size": asset->size
      },
      ctaLabel,
      ctaTitle,
      ctaText,
      ctaButtonLabel,
      seoTitle,
      seoDescription
    }`,
    { slug },
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
      manifestoAccentEnd,
      manifestoAfterEnd,
      servicesLabel,
      servicesTitle,
      servicesCtaLabel,
      whyLabel,
      whyTitle,
      whyText,
      aboutLabel,
      aboutTitle,
      aboutText,
      "aboutImageUrl": aboutImage.asset->url,
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
      videoUrl,
      videoLabel,
      videoText,
      "videoPosterUrl": videoPoster.asset->url,
      reviewsLabel,
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
