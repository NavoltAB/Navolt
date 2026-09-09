/**
 * One-shot content seed: the "Vad ingår"-cards on /campervan.
 *
 *   npm run seed:campervan            # dry run — prints what it would write
 *   npm run seed:campervan -- --write # actually patches the document
 *
 * Auth: SANITY_API_WRITE_TOKEN from .env.local when it's set, otherwise the
 * Sanity CLI's own session — same as the other seed scripts.
 *
 * Why: the customer wrote the section into the brödtext field as eight
 * paragraphs, each a label on one line and its description on the next. The
 * line break inside a block doesn't survive rendering, so every entry came out
 * as "Solcell Vi installerar solpaneler…" — the label running straight into the
 * sentence. Moving them into `features` puts the label in the card heading,
 * which is what it was always meant to be.
 *
 * Nothing is reworded. The eight labels and their sentences are the customer's
 * own; the only edit is in "Övervakning", where an em dash mid-sentence is
 * replaced by a full stop and a closing period added.
 *
 * No categories here. Marinelektronik is split into four because twenty cards
 * in one grid is a wall; eight is not, and inventing a grouping the customer
 * didn't write would be putting words in their mouth. FeatureList renders an
 * uncategorised list as the plain grid.
 *
 * This REPLACES `features` (empty on the document today) and CLEARS
 * `description` — leaving the brödtext would print the same eight entries
 * twice. `--write` prints the old brödtext as JSON before patching, so it can
 * be pasted back if the customer wants it.
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
 * The cards, in the order the customer wrote them.
 *
 * Written "Etikett - beskrivning": the label before the spaced hyphen becomes
 * the card's heading (splitFeature in lib/featureIcons.ts), so any dash inside
 * a sentence must be an en dash, and the label has to stay under 32 characters
 * or the split doesn't happen at all.
 *
 * Icons follow the ones marinelektronik uses for the same subjects, so a
 * visitor moving between the two pages meets the same symbol for solceller,
 * batterier, kopplingsschema and so on. Every key exists in lib/featureIcons.ts.
 */
const cards = [
  [
    'sol',
    'Solcell - Vi installerar solpaneler och regulatorer så du inte behöver koppla in på hela sommaren.',
  ],
  [
    'batteri',
    'Batterier - Vi konverterar ditt elsystem till litium och ser till att du har rätt laddning och övervakning. Vi utför avancerade batteritester som visar batteriets verkliga kapacitet och hälsa. Om batteriet är i dåligt skick kan vi hjälpa dig att byta till ett nytt.',
  ],
  [
    'overvakning',
    'Övervakning - Håll koll på din batteribank, tankar och temperatur. Vi erbjuder allt från enkla batterimonitorer till full distansövervakning.',
  ],
  [
    'varme',
    'Kyla/Värme - Vi installerar kylskåp/-boxar, varmvattenberedare och dieselvärmare.',
  ],
  [
    'wifi',
    'Wi-Fi - Vi hjälper dig med internet ombord. Med en router från Teltonika kan du få både 4G & 5G ombord.',
  ],
  [
    'ritning',
    'Kopplingsschema - Vi skapar ett detaljerat kopplingsschema anpassat specifikt för dina komponenter.',
  ],
  [
    'krets',
    'Systemdesign - Vi hjälper dig att designa ditt elsystem från grunden, anpassat efter dina förutsättningar, behov och önskemål.',
  ],
  [
    'radgivning',
    'Konsultation - Vill du göra jobbet själv? Vi hjälper dig med frågor och funderingar!',
  ],
]

// Array members need a _key of their own; the studio is unhappy without one.
const newKey = () => Math.random().toString(36).slice(2, 14)

const features = cards.map(([icon, text]) => ({
  _type: 'feature',
  _key: newKey(),
  icon,
  text,
}))

/**
 * The same rule splitFeature() applies, checked here rather than discovered on
 * the page: a label over 32 characters isn't treated as a label at all, and
 * the card silently renders as one unheaded paragraph.
 */
const unsplit = features.filter((f) => !/^(.{2,32}?) [-–—] ([\s\S]+)$/.test(f.text))
if (unsplit.length > 0) {
  console.error('Dessa kort får ingen rubrik — etiketten före " - " är för lång (max 32 tecken):')
  for (const f of unsplit) console.error(`  ${f.text.slice(0, 70)}…`)
  process.exit(1)
}

async function main() {
  const query = encodeURIComponent(
    '*[_type == "service" && slug.current == "campervan"]{ _id, title, features, description }'
  )
  const res = await fetch(`${api}/data/query/${dataset}?query=${query}&perspective=raw`, {
    headers: authHeader,
  })
  if (!res.ok) throw new Error(`Query failed (${res.status}): ${await res.text()}`)

  const { result: docs } = await res.json()
  if (!docs?.length) {
    throw new Error(`Hittade inget service-dokument med slug "campervan" i "${dataset}".`)
  }

  for (const item of features) {
    console.log(`  ${item.icon.padEnd(12)} ${item.text.split(' - ')[0]}`)
  }

  const ids = docs.map((doc) => doc._id)
  console.log(`\nDokument som skrivs över: ${ids.join(', ')}`)
  console.log(
    `Ersätter ${docs[0].features?.length ?? 0} befintliga punkter med ${features.length} kort.`
  )
  console.log(
    `Rensar brödtexten (${docs[0].description?.length ?? 0} block) — samma innehåll ` +
      'står nu i korten.'
  )

  if (!write) {
    console.log('\nTorrkörning. Kör "npm run seed:campervan -- --write" för att spara.')
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
