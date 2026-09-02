/**
 * One-shot migration: turns the old plain-string "Vad ingår" bullets into
 * { text, icon } objects, so every bullet can carry an icon.
 *
 *   npm run migrate:features            # dry run — prints what it would write
 *   npm run migrate:features -- --write # actually patches the documents
 *
 * Auth: SANITY_API_WRITE_TOKEN from .env.local when it's set, otherwise the
 * Sanity CLI's own session. Either way the token stays on this machine — it
 * only ever goes to Sanity's API.
 *
 * The icon is guessed from the bullet's own wording (the keyword table below);
 * anything unmatched gets the default bock, which the customer can change in
 * the studio afterwards. Every icon key here must exist in lib/featureIcons.ts.
 *
 * Published documents and their drafts are both patched — migrating only the
 * published one would let the untouched draft put the strings back on the next
 * publish.
 *
 * Safe to re-run: bullets that are already objects are left alone, and a
 * document with nothing left to convert isn't patched at all.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Same minimal .env.local reader as seed-brands.mjs — no dotenv dependency.
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

/**
 * The CLI keeps its session token in the user's global config. Falling back
 * to it means this one-off migration needs no project token minted just to
 * run once — `npx sanity login` is enough.
 */
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

/** First match wins, so the specific words sit above the general ones. */
const keywords = [
  [/solcell|solpanel|\bsol\b/i, 'sol'],
  [/litium|batteribank|batteri/i, 'batteri'],
  [/laddning|laddare|laddregulator/i, 'laddning'],
  [/landström|230 ?v|växelriktare/i, 'landstrom'],
  [/kopplingsschema|ritning|systemdesign|dimensioner/i, 'ritning'],
  [/övervak|koll på/i, 'overvakning'],
  [/mätning|instrument|givare|kontroll av/i, 'matning'],
  [/navigation|plotter|kompass|autopilot/i, 'navigation'],
  [/radar/i, 'radar'],
  [/vhf|radio|stereo|högtalare/i, 'vhf'],
  [/antenn/i, 'antenn'],
  [/satellit|starlink/i, 'satellit'],
  [/wi-?fi|internet|router|teltonika|\b4g\b|\b5g\b/i, 'wifi'],
  [/kylskåp|kylbox|frys/i, 'kylskap'],
  [/kyla|luftkonditioner/i, 'kyla'],
  [/värme|varmvatten|panna|webasto|eberspächer/i, 'varme'],
  [/fläkt|ventilation/i, 'flakt'],
  [/belysning|lampa|lysdiod|\bled\b/i, 'belysning'],
  [/ankarspel|ankare|elwinch|winch|dävert/i, 'ankare'],
  [/bogpropeller|däcksutrustning|segl|\bbåt/i, 'bat'],
  [/campervan|husbil/i, 'campervan'],
  [/felsök|startproblem/i, 'felsokning'],
  [/konsultation|rådgiv|frågor/i, 'radgivning'],
  [/garanti|besiktning|efterkontroll|tätning/i, 'garanti'],
  [/dokument|manual|paket/i, 'dokument'],
  [/kabel|dragning/i, 'kabel'],
  [/service|underhåll|byte|montering|installation/i, 'service'],
  [/\bel\b|ström|säkring|huvudbrytare/i, 'el'],
]

/**
 * Bullets are written "Etikett - beskrivning", and the label is what the
 * icon should follow: scanning the whole sentence gives "Övervakning" a
 * battery (from "batteribank") and "Laddning" a sun (from "solceller").
 * So the label is tried on its own first, the full text only as a backstop.
 */
function guessIcon(text) {
  const label = text.split(/ [-–—] /)[0]
  const match =
    keywords.find(([re]) => re.test(label)) ?? keywords.find(([re]) => re.test(text))
  return match ? match[1] : 'check'
}

// Array members need a _key of their own; the studio is unhappy without one.
const newKey = () => Math.random().toString(36).slice(2, 14)

async function main() {
  const query = encodeURIComponent('*[_type == "service"]{ _id, title, features }')
  const res = await fetch(`${api}/data/query/${dataset}?query=${query}&perspective=raw`, {
    headers: authHeader,
  })
  if (!res.ok) throw new Error(`Query failed (${res.status}): ${await res.text()}`)

  const { result: services } = await res.json()
  const mutations = []

  for (const service of services) {
    const features = service.features ?? []
    if (!features.some((feature) => typeof feature === 'string')) continue

    const converted = features.map((feature) =>
      typeof feature === 'string'
        ? { _type: 'feature', _key: newKey(), text: feature, icon: guessIcon(feature) }
        : feature
    )

    console.log(`\n${service.title ?? '(namnlös)'}  —  ${service._id}`)
    for (const feature of converted) {
      console.log(`  ${String(feature.icon ?? '—').padEnd(12)} ${feature.text}`)
    }

    mutations.push({ patch: { id: service._id, set: { features: converted } } })
  }

  if (mutations.length === 0) {
    console.log('Inget att konvertera — alla punkter har redan ikonfält.')
    return
  }

  if (!write) {
    console.log(
      `\nTorrkörning: ${mutations.length} dokument skulle uppdateras.` +
        '\nKör "npm run migrate:features -- --write" för att spara.'
    )
    return
  }

  const mutateRes = await fetch(`${api}/data/mutate/${dataset}`, {
    method: 'POST',
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mutations }),
  })
  if (!mutateRes.ok) {
    throw new Error(`Patching failed (${mutateRes.status}): ${await mutateRes.text()}`)
  }

  console.log(`\nKlart — ${mutations.length} dokument uppdaterade i datasetet "${dataset}".`)
  console.log('Gå igenom ikonerna i studion under Tjänster > Vad ingår.')
}

main().catch((err) => {
  console.error(`\n${err.message}`)
  process.exit(1)
})
