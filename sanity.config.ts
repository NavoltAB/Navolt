import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemas } from '@/sanity/schemas'
import { siteConfig } from '@/config/site'

export default defineConfig({
  name: 'navolt',
  title: siteConfig.name,
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  basePath: '/studio',
  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Innehåll')
          .items([
            S.listItem()
              .title('Startsida')
              .child(S.document().schemaType('homePage').documentId('homePage')),
            // Page-level copy, in the same order as the site navigation. The
            // documents these pages *list* — services, products — live under
            // the divider below.
            S.listItem()
              .title('Tjänstesida')
              .child(S.document().schemaType('tjansterPage').documentId('tjansterPage')),
            S.listItem()
              .title('Produktsida')
              .child(S.document().schemaType('productsPage').documentId('productsPage')),
            S.listItem()
              .title('Om oss')
              .child(S.document().schemaType('aboutPage').documentId('aboutPage')),
            S.listItem()
              .title('Kontakt')
              .child(S.document().schemaType('kontaktPage').documentId('kontaktPage')),
            S.listItem()
              .title('Webbplatsinställningar')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.divider(),
            S.listItem()
              .title('Kategorier')
              .child(S.documentTypeList('category')),
            S.listItem()
              .title('Produkter')
              .child(
                S.list()
                  .title('Produkter')
                  .items([
                    S.listItem()
                      .title('Alla produkter')
                      .child(
                        S.documentTypeList('product')
                          .defaultOrdering([{ field: 'name', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('Per kategori')
                      .child(async () => {
                        const categories = await context
                          .getClient({ apiVersion: '2024-01-01' })
                          .fetch<{ _id: string; title: string }[]>(
                            '*[_type == "category"] | order(title asc) { _id, title }'
                          )
                        return S.list()
                          .title('Välj kategori')
                          .items(
                            categories.map((cat) =>
                              S.listItem()
                                .title(cat.title)
                                .child(
                                  S.documentList()
                                    .title(cat.title)
                                    .filter('_type == "product" && category._ref == $catId')
                                    .params({ catId: cat._id })
                                    .defaultOrdering([{ field: 'name', direction: 'asc' }])
                                )
                            )
                          )
                      }),
                    S.listItem()
                      .title('Per båtmodell')
                      .child(async () => {
                        const models = await context
                          .getClient({ apiVersion: '2024-01-01' })
                          .fetch<{ _id: string; name: string }[]>(
                            '*[_type == "boatModel"] | order(order asc, name asc) { _id, name }'
                          )
                        return S.list()
                          .title('Välj båtmodell')
                          .items(
                            models.map((model) =>
                              S.listItem()
                                .title(model.name)
                                .child(
                                  S.documentList()
                                    .title(model.name)
                                    .filter('_type == "product" && boatModel._ref == $modelId')
                                    .params({ modelId: model._id })
                                    .defaultOrdering([{ field: 'name', direction: 'asc' }])
                                )
                            )
                          )
                      }),
                    S.divider(),
                    S.listItem()
                      .title('Utvalda (startsidan)')
                      .child(
                        S.documentList()
                          .title('Utvalda produkter')
                          .filter('_type == "product" && featured == true')
                          .defaultOrdering([{ field: 'name', direction: 'asc' }])
                      ),
                    S.listItem()
                      .title('Beställningsvaror')
                      .child(
                        S.documentList()
                          .title('Beställningsvaror')
                          .filter('_type == "product" && inStock == false')
                          .defaultOrdering([{ field: 'name', direction: 'asc' }])
                      ),
                  ])
              ),
            S.listItem()
              .title('Tjänster')
              .child(S.documentTypeList('service')),
            S.listItem()
              .title('Varumärken')
              .child(
                S.documentTypeList('brand')
                  .title('Varumärken')
                  .defaultOrdering([{ field: 'order', direction: 'asc' }])
              ),
            S.listItem()
              .title('Båtmodeller')
              .child(
                S.documentTypeList('boatModel')
                  .title('Båtmodeller')
                  .defaultOrdering([
                    { field: 'order', direction: 'asc' },
                    { field: 'name', direction: 'asc' },
                  ])
              ),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemas },
})
