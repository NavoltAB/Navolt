/**
 * The shape of the contact form, shared by the form and the API route.
 *
 * The visitor picks what the enquiry is about, and that choice decides which
 * follow-up questions appear. Both sides need to agree on that mapping — the
 * form to render the fields, the route to label them in the email and to throw
 * away anything that doesn't belong to the chosen subject — so it is declared
 * once, here, and imported by both.
 *
 * Adding a question means adding it to `FIELDS_BY_SUBJECT` and to
 * `CONDITIONAL_KEYS`. Nothing else needs to change.
 */

export const SUBJECTS = ['Båt', 'Campervan', 'Båtrutor', 'Husbil', 'Övrigt'] as const
export type Subject = (typeof SUBJECTS)[number]

export const CONDITIONAL_KEYS = [
  'boatHelp',
  'boatModel',
  'boatLocation',
  'boatPlacement',
  'windowRequest',
  'vehicleModel',
  'vehicleLocation',
] as const
export type ConditionalKey = (typeof CONDITIONAL_KEYS)[number]

export type ContactField = {
  key: ConditionalKey
  /** Shown above the field, and used as the row label in the email. */
  label: string
  /** Text fields only. */
  placeholder?: string
  /** Present means a radio group rather than a text field. */
  options?: readonly string[]
  /** Text fields that pair up two-per-row. Radios always take a full row. */
  half?: boolean
}

const BOAT_WHERE: ContactField[] = [
  { key: 'boatModel', label: 'Båtmodell', placeholder: 'Ange båtmodell', half: true },
  { key: 'boatLocation', label: 'Var ligger båten?', placeholder: 'Ange plats', half: true },
]

/** `vehicleLocation` is deliberately one key with two labels — a campervan and
 *  a motorhome ask the same question, and the inbox should read naturally for
 *  both without a second field that means the same thing. */
const vehicle = (whereLabel: string): ContactField[] => [
  {
    key: 'vehicleModel',
    label: 'Bilmärke, modell och årsmodell',
    placeholder: 'Skriv ditt svar…',
    half: true,
  },
  { key: 'vehicleLocation', label: whereLabel, placeholder: 'Ange plats', half: true },
]

export const FIELDS_BY_SUBJECT: Record<Subject, ContactField[]> = {
  Båt: [
    {
      key: 'boatHelp',
      label: 'Vad behöver du hjälp med i din båt?',
      options: ['El/elsystem', 'Motor', 'Annat'],
    },
    ...BOAT_WHERE,
    {
      key: 'boatPlacement',
      label: 'Är din båt för närvarande i vattnet eller på land?',
      options: ['I vattnet', 'På land'],
    },
  ],
  Campervan: vehicle('Var finns din van?'),
  Båtrutor: [
    ...BOAT_WHERE,
    {
      key: 'windowRequest',
      label: 'Vill du göra en förfrågan om en båtmodell som inte finns tillgänglig just nu?',
      options: ['Ja', 'Nej'],
    },
  ],
  Husbil: vehicle('Var finns din bil?'),
  Övrigt: [],
}

export function isSubject(value: string): value is Subject {
  return (SUBJECTS as readonly string[]).includes(value)
}

/**
 * Maps the `?amne=` parameter that /tjanster links with onto a subject.
 *
 * The service tiles there don't line up one-to-one with the five options:
 * "Motorservice" is a boat job, so it selects Båt and ticks Motor rather than
 * dropping the visitor into Övrigt having lost what they clicked.
 */
export function prefillFromParam(value: string): { subject: Subject | ''; boatHelp?: string } {
  const v = value.trim()
  if (!v) return { subject: '' }
  if (v.toLowerCase() === 'motorservice') return { subject: 'Båt', boatHelp: 'Motor' }
  const hit = SUBJECTS.find((s) => s.toLowerCase() === v.toLowerCase())
  return { subject: hit ?? '' }
}

/* --- Attachments ------------------------------------------------------- */

export const MAX_FILES = 5
/**
 * Vercel caps a serverless request body at 4.5 MB and answers a bigger one with
 * an opaque 413 that never reaches the route. Staying under that is what keeps
 * an oversized upload a readable Swedish error instead of a dead submit button,
 * so the form checks this before sending and the route checks it again after.
 */
export const MAX_TOTAL_BYTES = 4 * 1024 * 1024

export const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.pdf']
const ACCEPTED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
]

/** Safari reports an empty type for HEIC often enough that the extension has to
 *  be a valid second opinion — otherwise every photo straight off an iPhone is
 *  rejected. */
export function isAcceptedFile(file: { name: string; type: string }) {
  if (ACCEPTED_MIME.includes(file.type)) return true
  const dot = file.name.lastIndexOf('.')
  return dot > -1 && ACCEPTED_EXTENSIONS.includes(file.name.slice(dot).toLowerCase())
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
