/**
 * One-shot content seed: the "Vad ingår"-cards on /motorservice.
 *
 *   npm run seed:motorservice            # dry run — prints what it would write
 *   npm run seed:motorservice -- --write # actually patches the document
 *
 * Auth: SANITY_API_WRITE_TOKEN from .env.local when it's set, otherwise the
 * Sanity CLI's own session — same as scripts/seed-marinelektronik-cards.mjs.
 *
 * Why: the customer wrote the whole service into the brödtext field as four
 * h3-headings with bullet lists under them, which renders as a long grey
 * column of bare terms — nothing like the cards on /marinelektronik. This
 * moves the same content into the `features` array, where the four headings
 * become "Kategori"-rows and each bullet becomes a card with a sentence
 * explaining what it actually means.
 *
 * Nothing the customer wrote is dropped. The eleven vinterkonservering
 * bullets are folded into nine cards (oljebyte and oljefilterbyte are one
 * card, impeller/remmar/slangar another) because a card per line made cards
 * with nothing in them; every original line still appears inside a card's
 * text, their intro sentence included.
 *
 * This REPLACES `features` (which is empty on the document today) and CLEARS
 * `description` — leaving the brödtext in place would print the same list
 * twice, once as a wall and once as cards. `--write` prints the old brödtext
 * as JSON before patching, so it can be pasted back if the customer wants it.
 *
 * Published document and draft are both patched, so an untouched draft can't
 * put the wall of text back on the next publish.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Same minimal .env.local reader as the other scripts — no dotenv dependency.
function loadEnv() {
  const envPath = path.join(root, '.env.local')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
    }
  }
}

loadEnv()

function cliToken() {
  const home = process.env.USERPROFILE || process.env.HOME
  if (!home) return ''
  const configPath = path.join(home, '.config', 'sanity', 'config.json')
  if (!existsSync(configPath)) return ''
  try {
    return JSON.parse(readFileSync(configPath, 'utf8')).authToken ?? ''
  } catch {
    return ''
  }
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN || cliToken()
const write = process.argv.includes('--write')

if (!projectId || !token) {
  console.error('Missing config. Need NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local, and either')
  console.error('a SANITY_API_WRITE_TOKEN there (sanity.io/manage > API > Tokens, role Editor)')
  console.error('or a logged-in CLI session ("npx sanity login").')
  process.exit(1)
}

const api = `https://${projectId}.api.sanity.io/v2024-01-01`
const authHeader = { Authorization: `Bearer ${token}` }

/**
 * The cards, in page order.
 *
 * Written "Etikett - beskrivning": the label before the spaced hyphen becomes
 * the card's heading (splitFeature in lib/featureIcons.ts), so any dash inside
 * a sentence must be an en dash, and the label has to stay under 32 characters
 * or the split doesn't happen at all.
 *
 * Every icon key has to exist in lib/featureIcons.ts.
 */
const cards = [
  [null, 'Service'],
  [
    'olja',
    'Motorolja och oljefilter - Vi byter motorolja och oljefilter enligt tillverkarens intervall, så att smörjningen håller genom säsongen.',
  ],
  [
    'bransle',
    'Bränslefilter - Vi byter bränslefiltret och tömmer vattenavskiljaren, så att smuts och vatten i tanken inte når motorn.',
  ],
  [
    'flakt',
    'Impeller - Vi byter impellern i sjövattenpumpen och kontrollerar att inga lossnade blad ligger kvar längre fram i kylsystemet.',
  ],
  [
    'garanti',
    'Zinkanoder - Vi kontrollerar och byter zinkanoderna – offeranoderna som tar korrosionen i stället för motorn.',
  ],
  [
    'vatten',
    'Sjövattenfilter - Vi rengör sjövattenfiltret och kontrollerar att kylvattnet har fri väg hela sträckan in.',
  ],
  [
    'kyla',
    'Glykol och fryspunkt - Vi mäter fryspunkten i kylsystemet och fyller på eller byter glykol när skyddet inte räcker.',
  ],
  [
    'service',
    'Remmar och slangar - Vi går igenom remmar, slangar och klammor och byter det som är sprucket, glappt eller på väg att ge upp.',
  ],
  [
    'motor',
    'Smörjpunkter - Vi smörjer reglage, länkage och övriga smörjpunkter så att det som ska röra sig fortsätter göra det.',
  ],

  [null, 'Kontroll & genomgång'],
  [
    'felsokning',
    'Läckagekontroll - Vi letar efter läckage av olja och vatten i motorrummet och spårar var det kommer ifrån.',
  ],
  [
    'motor',
    'Backslag - Vi kontrollerar oljenivå och oljans skick i backslaget, och byter oljan där den behöver bytas.',
  ],
  [
    'laddning',
    'Generator och laddsystem - Vi kontrollerar att generatorn laddar som den ska och att spänningen ut till batterierna är rätt.',
  ],
  [
    'el',
    'Elsystem - Vi går igenom motorns elsystem – kablage, kontakter och säkringar – och felsöker det som inte fungerar.',
  ],

  [null, 'Felsökning'],
  [
    'strom',
    'Startproblem - Motorn som inte drar runt, eller drar runt utan att starta. Vi spårar felet till batteri, startmotor, bränsle eller tändning.',
  ],
  [
    'varme',
    'Överhettning - Vi följer kylvattnet hela vägen, från sjövattenintag och impeller till värmeväxlare och termostat.',
  ],
  [
    'matning',
    'Ojämn gång och driftstörningar - Motorn som hackar, tappar varv eller stannar. Vi mäter oss fram till orsaken i stället för att byta delar på chans.',
  ],
  [
    'krets',
    'Startmotor och tändsystem - Vi kontrollerar startmotor, solenoid och tändsystem och byter det som inte längre gör sitt jobb.',
  ],

  [null, 'Vinterkonservering'],
  [
    'motor',
    'Inför vintern - Vi förbereder din motor inför vintern för att undvika frostskador, korrosion och problem till nästa säsong.',
  ],
  [
    'olja',
    'Oljebyte och oljefilter - Vi byter olja i motorn och vid behov i backslaget, tillsammans med oljefiltret, så att gammal olja inte står och fräter över vintern.',
  ],
  [
    'bransle',
    'Bränslestabilisator - Vi tillsätter bränslestabilisator så att bränslet i tanken håller sig genom uppläggningen.',
  ],
  [
    'kyla',
    'Frostskydd i kylsystemet - Vi kör igenom kylsystemet med glykol och kontrollerar att fryspunkten klarar vintern.',
  ],
  [
    'vatten',
    'Sjövattenkretsen - Vi tömmer och konserverar sjövattenkretsen så att inget vatten står kvar och fryser sönder något.',
  ],
  [
    'flakt',
    'Impeller, remmar och slangar - Vi kontrollerar impeller, remmar och slangar och noterar det som bör bytas innan sjösättning.',
  ],
  [
    'service',
    'Smörjning - Vi smörjer rörliga delar så att inget kärvar eller rostar fast under vinterförvaringen.',
  ],
  [
    'batteri',
    'Batteri och laddning - Vi kontrollerar batteriets skick och att laddningen fungerar inför vinterförvaringen.',
  ],
  [
    'felsokning',
    'Visuell läckagekontroll - Vi går igenom motorrummet okulärt och letar efter läckage av olja och vatten.',
  ],
  [
    'radgivning',
    'Inför nästa säsong - Du får en genomgång av vad vi hittade och vad som bör åtgärdas innan båten sjösätts igen.',
  ],
]

// Array members need a _key of their own; the studio is unhappy without one.
const newKey = () => Math.random().toString(36).slice(2, 14)

/** A null icon marks a category row — `[null, rubrik]`. The rest are cards. */
const features = cards.map(([icon, text]) =>
  icon === null
    ? { _type: 'featureGroup', _key: newKey(), title: text }
    : { _type: 'feature', _key: newKey(), icon, text }
)

/**
 * The same rule splitFeature() applies, checked here rather than discovered on
 * the page: a label over 32 characters isn't treated as a label at all, and
 * the card silently renders as one unheaded paragraph. Cheap to get wrong when
 * editing the list above, and invisible until someone looks at the page.
 */
const unsplit = features.filter(
  (f) => f._type === 'feature' && !/^(.{2,32}?) [-–—] ([\s\S]+)$/.test(f.text)
)
if (unsplit.length > 0) {
  console.error('Dessa kort får ingen rubrik — etiketten före " - " är för lång (max 32 tecken):')
  for (const f of unsplit) console.error(`  ${f.text.slice(0, 70)}…`)
  process.exit(1)
}

async function main() {
  const query = encodeURIComponent(
    '*[_type == "service" && slug.current == "motorservice"]{ _id, title, features, description }'
  )
  const res = await fetch(`${api}/data/query/${dataset}?query=${query}&perspective=raw`, {
    headers: authHeader,
  })
  if (!res.ok) throw new Error(`Query failed (${res.status}): ${await res.text()}`)

  const { result: docs } = await res.json()
  if (!docs?.length) {
    throw new Error(`Hittade inget service-dokument med slug "motorservice" i "${dataset}".`)
  }

  for (const item of features) {
    if (item._type === 'featureGroup') console.log(`\n— ${item.title}`)
    else console.log(`  ${item.icon.padEnd(12)} ${item.text.split(' - ')[0]}`)
  }

  const ids = docs.map((doc) => doc._id)
  const cardCount = features.filter((f) => f._type === 'feature').length
  const groupCount = features.filter((f) => f._type === 'featureGroup').length
  console.log(`\nDokument som skrivs över: ${ids.join(', ')}`)
  console.log(
    `Ersätter ${docs[0].features?.length ?? 0} befintliga punkter med ` +
      `${cardCount} kort i ${groupCount} kategorier.`
  )
  console.log(
    `Rensar brödtexten (${docs[0].description?.length ?? 0} block) — samma innehåll ` +
      'står nu i korten.'
  )

  if (!write) {
    console.log('\nTorrkörning. Kör "npm run seed:motorservice -- --write" för att spara.')
    return
  }

  // Printed before the patch, so the old copy is recoverable from the terminal
  // even if nobody kept a copy of the studio field.
  console.log('\nGammal brödtext (JSON), spara om den ska kunna läggas tillbaka:')
  console.log(JSON.stringify(docs[0].description ?? null))

  const mutations = ids.map((id) => ({
    patch: { id, set: { features }, unset: ['description'] },
  }))
  const mutateRes = await fetch(`${api}/data/mutate/${dataset}`, {
    method: 'POST',
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mutations }),
  })
  if (!mutateRes.ok) {
    throw new Error(`Patching failed (${mutateRes.status}): ${await mutateRes.text()}`)
  }

  console.log(`\nKlart — ${ids.length} dokument uppdaterade i datasetet "${dataset}".`)
  console.log('Publicera i studion om ändringen ligger kvar som utkast.')
}

main().catch((err) => {
  console.error(`\n${err.message}`)
  process.exit(1)
})
