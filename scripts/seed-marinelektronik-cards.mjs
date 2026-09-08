/**
 * One-shot content seed: the "Vad ingår"-cards on /marinelektronik, split into
 * the four categories the customer signed off on in
 * navolt-marinelektronik-kortlayout-4.pdf.
 *
 *   npm run seed:marinelektronik            # dry run — prints what it would write
 *   npm run seed:marinelektronik -- --write # actually patches the document
 *
 * Auth: SANITY_API_WRITE_TOKEN from .env.local when it's set, otherwise the
 * Sanity CLI's own session — same as scripts/migrate-service-features.mjs.
 *
 * This REPLACES the whole features array on the marinelektronik document: the
 * twelve cards that were there are rewritten and re-split into twenty, so
 * there is nothing to merge. Everything else on the document is untouched, and
 * the array stays editable in the studio afterwards — the categories are
 * "Kategori" items in the same list (sanity/schemas/service.ts).
 *
 * Published document and draft are both patched. Patching only the published
 * one would let an untouched draft put the old twelve cards back on the next
 * publish.
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
 * The cards, in page order. Written "Etikett - beskrivning": the label before
 * the spaced hyphen becomes the card's heading (see splitFeature in
 * lib/featureIcons.ts), so the separator inside a sentence must be an en dash.
 *
 * Every icon key has to exist in lib/featureIcons.ts.
 */
const cards = [
  ['Elsystem & energi'],
  [
    'el',
    'Kompletta elsystem - Vi bygger kompletta elsystem och moderniserar äldre installationer – från batteribank och laddning till distribution, kablage och övervakning.',
  ],
  [
    'batteri',
    'Litiumkonvertering - Vi konverterar elsystem till litium och ser till att laddning, kablage, säkringar och övervakning är anpassade för den nya batteribanken.',
  ],
  [
    'batteritest',
    'Batterier & batteritest - Vi utför batteritester som visar batteriernas verkliga kapacitet och hälsa. Om batterierna är i dåligt skick hjälper vi dig att välja och installera nya.',
  ],
  [
    'laddning',
    'Laddning - Vi installerar och uppgraderar laddning från landström, generator och solceller – från enstaka laddare till kompletta system med inverter/laddare.',
  ],
  [
    'sol',
    'Solceller - Vi installerar solpaneler och regulatorer som hjälper till att hålla batterierna laddade och ger dig större frihet från landström.',
  ],
  [
    'overvakning',
    'Övervakning - Håll koll på batteribank, tankar och temperatur – från enkla batterimonitorer till full övervakning och fjärrstyrning på distans.',
  ],

  ['Navigation & kommunikation'],
  [
    'navigation',
    'Navigation - Vi installerar och uppgraderar plotter, radar och ekolod från bland annat B&G, Garmin, Lowrance, Raymarine och Simrad.',
  ],
  [
    'vhf',
    'AIS & VHF - Vi installerar AIS och VHF för bättre överblick över trafiken omkring dig och säkrare kommunikation.',
  ],
  [
    'ratt',
    'Autopilot - Vi installerar och uppgraderar autopiloter från bland annat Garmin och Raymarine – för en bekvämare färd och enklare hantering, särskilt på längre sträckor eller med liten besättning.',
  ],
  [
    'matning',
    'Instrument - Vi installerar och uppgraderar instrument för vind, fart, djup och temperatur – både som fristående instrument och som en del av ett större navigationssystem.',
  ],
  [
    'natverk',
    'Nätverk ombord - Vi installerar och bygger ut nätverk med NMEA 2000 och SeaTalkng för att samla plotter, instrument, autopilot och annan marinelektronik i ett gemensamt system.',
  ],
  [
    'wifi',
    'Internet ombord - Vi installerar routrar och antenner för en stabilare internetanslutning ombord via 4G eller 5G.',
  ],

  ['Komfort & utrustning'],
  [
    'kylskap',
    'Kyla - Vi installerar kylskåp och kylboxar – från byte av befintlig utrustning till helt nya installationer.',
  ],
  [
    'panna',
    'Värme - Förläng båtsäsongen med värme och varmvatten ombord. Vi installerar och byter dieselvärmare och varmvattenberedare.',
  ],
  [
    'ankare',
    'Ankarspel - Vi installerar ankarspel från bland annat Sleipner, Lewmar och Quick/Balder – både vid nyinstallation och när ett befintligt ankarspel ska bytas ut.',
  ],
  ['bat', 'Elwinch - Vi installerar elwinchar som gör det enklare att skota och trimma seglen ombord.'],

  ['Felsökning & planering'],
  [
    'felsokning',
    'Felsökning - Vi hjälper till med felsökning av el och elektronik ombord när något inte fungerar som det ska.',
  ],
  [
    'krets',
    'Systemdesign - Vi hjälper dig att designa ditt elsystem från grunden, anpassat efter dina förutsättningar, behov och önskemål.',
  ],
  [
    'ritning',
    'Kopplingsschema - Vi skapar ett detaljerat kopplingsschema anpassat efter dina komponenter.',
  ],
  [
    'radgivning',
    'Konsultation - Vill du göra jobbet själv? Vi hjälper dig med planering, komponentval och frågor kring installationen.',
  ],
]

// Array members need a _key of their own; the studio is unhappy without one.
const newKey = () => Math.random().toString(36).slice(2, 14)

/** A one-element row is a category heading, a two-element row is a card. */
const features = cards.map(([a, b]) =>
  b === undefined
    ? { _type: 'featureGroup', _key: newKey(), title: a }
    : { _type: 'feature', _key: newKey(), icon: a, text: b }
)

async function main() {
  const query = encodeURIComponent(
    '*[_type == "service" && slug.current == "marinelektronik"]{ _id, title, features }'
  )
  const res = await fetch(`${api}/data/query/${dataset}?query=${query}&perspective=raw`, {
    headers: authHeader,
  })
  if (!res.ok) throw new Error(`Query failed (${res.status}): ${await res.text()}`)

  const { result: docs } = await res.json()
  if (!docs?.length) {
    throw new Error(`Hittade inget service-dokument med slug "marinelektronik" i "${dataset}".`)
  }

  for (const item of features) {
    if (item._type === 'featureGroup') console.log(`\n— ${item.title}`)
    else console.log(`  ${item.icon.padEnd(12)} ${item.text.split(' - ')[0]}`)
  }

  const ids = docs.map((doc) => doc._id)
  console.log(`\nDokument som skrivs över: ${ids.join(', ')}`)
  console.log(
    `Ersätter ${docs[0].features?.length ?? 0} befintliga punkter med ` +
      `${features.filter((f) => f._type === 'feature').length} kort i ` +
      `${features.filter((f) => f._type === 'featureGroup').length} kategorier.`
  )

  if (!write) {
    console.log('\nTorrkörning. Kör "npm run seed:marinelektronik -- --write" för att spara.')
    return
  }

  const mutations = ids.map((id) => ({ patch: { id, set: { features } } }))
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
