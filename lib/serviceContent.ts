import type { Service, ServiceHighlight, ServicePhoto, ServiceStep } from '@/types/sanity'

/**
 * What a service page shows before anyone has filled it in.
 *
 * Two layers, both PLACEHOLDER COPY:
 *
 *   · `defaultServices` — the four segments themselves. /tjanster lists these
 *     and /[slug] renders them, so both stand up with no Sanity project
 *     configured at all, which is the rule for every page on this site.
 *
 *   · `defaultServicePages` — the longer page copy, keyed by slug. Only
 *     båtrutor has any: it's the page the old site ranked on and the one with
 *     photography to hang a layout off. The other three render the sections
 *     they have content for and simply leave out the rest.
 *
 * Anything the customer writes in the studio overrides all of it. Nothing here
 * states a price or a lead time — don't add one without their sign-off.
 */

export const defaultServices: Service[] = [
  {
    _id: 'bat',
    slug: 'bat',
    title: 'Båt',
    shortDescription:
      'El och elektronik i fritidsbåten — från ett enskilt fel till ett helt nytt elsystem. Vi arbetar med både äldre båtar och nybyggen.',
    features: [
      { icon: 'felsokning', text: 'Felsökning av el- och laddsystem' },
      { icon: 'navigation', text: 'Navigation, plotter, radar och VHF' },
      { icon: 'landstrom', text: 'Landström, laddare och batteribankar' },
      { icon: 'belysning', text: 'Belysning och inredningsel' },
      { icon: 'ankare', text: 'Bogpropeller och däcksutrustning' },
    ],
    imageUrl: '/images/boat-img.jpg',
  },
  {
    _id: 'campervan',
    slug: 'campervan',
    title: 'Campervan',
    shortDescription:
      'Skräddarsytt elsystem i campervan och husbil. Vi dimensionerar efter hur du faktiskt använder bilen — inte efter en standardmall.',
    features: [
      { icon: 'sol', text: 'Solceller och laddregulatorer' },
      { icon: 'batteri', text: 'Litiumbank och batteriövervakning' },
      { icon: 'el', text: 'Växelriktare och 230 V ombord' },
      { icon: 'varme', text: 'Värme och kyla' },
      { icon: 'campervan', text: 'Komplett installation från grunden' },
    ],
    imageUrl: '/images/campervan-img.jpg',
  },
  {
    _id: 'motorservice',
    slug: 'motorservice',
    title: 'Motorservice',
    shortDescription:
      'Service och felsökning på båtmotorn. Vi tar hand om det löpande underhållet och letar rätt på felet när något krånglar.',
    features: [
      { icon: 'service', text: 'Löpande service och underhåll' },
      { icon: 'felsokning', text: 'Felsökning vid startproblem' },
      { icon: 'service', text: 'Byte av impeller, filter och olja' },
      { icon: 'matning', text: 'Kontroll av drev och kylsystem' },
      { icon: 'bat', text: 'Inför- och avrustning för säsong' },
    ],
    imageUrl: '/images/motorservice.jpg',
  },
  {
    _id: 'batrutor',
    slug: 'batrutor',
    title: 'Båtrutor',
    shortDescription:
      'Byte och montering av båtrutor, med kompletta monteringspaket för de vanligaste båtmodellerna.',
    features: [
      { icon: 'service', text: 'Byte av spruckna och immiga rutor' },
      { icon: 'ritning', text: 'Måttanpassad tillverkning' },
      { icon: 'dokument', text: 'Kompletta monteringspaket' },
      { icon: 'garanti', text: 'Tätning och efterkontroll' },
    ],
    imageUrl: '/images/batrutor/batrutor-1.jpg',
  },
]

export interface ServicePageDefaults {
  /** Falls back to the service's title / kort beskrivning when absent. */
  seoTitle?: string
  seoDescription?: string
  featuresLabel?: string
  introLabel?: string
  introTitle?: string
  /** Rendered only when the document has no "Fullständig beskrivning". */
  introParagraphs?: string[]
  stepsLabel?: string
  stepsTitle?: string
  steps?: ServiceStep[]
  /** The wide image-and-text bands. Båtrutor runs two: monteringspaketen
   *  and rutpaketen. */
  highlights?: ServiceHighlight[]
  video?: {
    /** A full YouTube link or a bare id — both go through parseYouTubeId(). */
    url?: string
    label?: string
    title?: string
    posterUrl?: string
  }
  gallery?: ServicePhoto[]
  documentsLabel?: string
  documentsTitle?: string
  documentsText?: string
  ctaLabel?: string
  ctaTitle?: string
  ctaText?: string
  ctaButtonLabel?: string
}

/** The closing band, for a service with nothing more specific to say. */
export const genericPageDefaults: ServicePageDefaults = {
  introLabel: 'Vad vi gör',
  ctaLabel: 'Nästa steg',
  ctaTitle: 'Berätta vad som krånglar',
  ctaText:
    'Beskriv symptomen så gott du kan, så hör vi av oss och reder ut resten tillsammans. Är det bråttom går det lika bra att ringa.',
  ctaButtonLabel: 'Kontakta oss',
}

export const defaultServicePages: Record<string, ServicePageDefaults> = {
  batrutor: {
    // This is the page that ranks on "båtrutor" — the title is doing real
    // work in the search result, so it says more than the bare word.
    seoTitle: 'Båtrutor — byte, montering och monteringspaket',
    seoDescription:
      'Byte och montering av båtrutor. Måttanpassad tillverkning och kompletta monteringspaket för de vanligaste båtmodellerna. Navolt i Göteborg, Öckerö och Hälsö.',
    introLabel: 'Vad vi gör',
    introTitle: 'Rutor som håller tätt',
    introParagraphs: [
      'En sprucken eller immig ruta är sällan bara en skönhetsfråga. Släpper tätningen följer fukten med in i inredningen, och då blir jobbet större än att byta själva rutan.',
      'Vi byter och monterar rutor i fritidsbåtar — enstaka rutor såväl som hela set. Där vi har måtten för båtmodellen tillverkas rutan efter dem; annars mäter vi upp, eller använder den gamla rutan som mall.',
      'Vet du inte vilken ruta du behöver? Hör av dig med båtmodell och gärna en bild, så återkommer vi med ett förslag.',
    ],
    // No steps here on purpose. The monteringsanvisning is the step-by-step
    // account, and a placeholder set would reappear the moment the customer
    // emptied the field in the studio — an editor can't delete a fallback.
    documentsText:
      'Hela arbetsgången står i monteringsanvisningen — verktyg, produkter, mått och torktider, steg för steg. Ladda ner den och ha den till hands vid monteringen.',
    highlights: [
      {
        imageUrl: '/images/batrutor/monteringspaket.jpeg',
        label: 'Monterar du själv?',
        title: 'Kompletta monteringspaket',
        text: 'Till de vanligaste båtmodellerna finns rutorna som kompletta paket med det som behövs för monteringen. Du hittar dem i sortimentet, sorterade efter båtmodell.',
        ctaLabel: 'Till sortimentet',
        // Unknown category slugs are dropped by /produkter rather than filtering
        // to an empty grid, so this degrades to the full catalogue if the
        // category ends up named something else.
        ctaHref: '/produkter?kategori=batrutor',
      },
    ],
    // The monteringspaket shot carries the highlight band above, so it isn't
    // repeated here.
    gallery: [
      { url: '/images/batrutor/batrutor-1.jpg', alt: 'Båtruta monterad i ruff' },
      { url: '/images/batrutor/batrutor-2.jpg', alt: 'Båtrutor på verkstaden' },
      { url: '/images/batrutor/batrutor-3.jpg', alt: 'Närbild på monterad båtruta' },
    ],
    ctaLabel: 'Nästa steg',
    ctaTitle: 'Berätta vilken båt du har',
    ctaText:
      'Skicka båtmodell och gärna en bild på rutan, så återkommer vi med en bedömning. Är det bråttom går det lika bra att ringa.',
    ctaButtonLabel: 'Kontakta oss',
  },

}
