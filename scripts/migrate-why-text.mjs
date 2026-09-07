/**
 * One-shot migration: folds the old "Varför Navolt" punktlista (`whyItems`)
 * into the single text field that replaced it (`whyText`), then removes the
 * old field so the studio stops reporting it as unknown.
 *
 *   npm run migrate:why            # dry run — prints what it would write
 *   npm run migrate:why -- --write # actually patches the documents
 *
 * Auth: SANITY_API_WRITE_TOKEN from .env.local when it's set, otherwise the
 * Sanity CLI's own session. Either way the token stays on this machine — it
 * only ever goes to Sanity's API.
 *
 * Every rubrik and text in the list becomes its own paragraph, in order,
 * separated by a blank line — which is how the page splits the field. A
 * one-character rubrik is dropped: the old schema required a rubrik, so a
 * lone "·" is a placeholder someone typed to get past validation, not copy.
 *
 * Published documents and their drafts are both patched — migrating only the
 * published one would let the untouched draft put `whyItems` back on the next
 * publish.
 *
 * Safe to re-run: a document with no `whyItems` left isn't patched, and an
 * existing `whyText` is never overwritten.
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

const paragraphsFrom = (items) =>
  items
    .flatMap((item) => [item?.title, item?.text])
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value) => value.length > 1)
    .join('\n\n')

async function main() {
  const query = encodeURIComponent('*[_type == "homePage"]{ _id, whyText, whyItems }')
  const res = await fetch(`${api}/data/query/${dataset}?query=${query}&perspective=raw`, {
    headers: authHeader,
  })
  if (!res.ok) throw new Error(`Query failed (${res.status}): ${await res.text()}`)

  const { result: documents } = await res.json()
  const mutations = []

  for (const doc of documents) {
    if (!Array.isArray(doc.whyItems)) continue

    const patch = { id: doc._id, unset: ['whyItems'] }
    const merged = paragraphsFrom(doc.whyItems)
    const keepExisting = typeof doc.whyText === 'string' && doc.whyText.trim().length > 0

    if (merged && !keepExisting) patch.set = { whyText: merged }

    console.log(`\n${doc._id}`)
    if (patch.set) {
      for (const paragraph of merged.split('\n\n')) console.log(`  + ${paragraph}`)
    } else {
      console.log(keepExisting ? '  (Varför — Text är redan ifylld, lämnas orörd)' : '  (tom lista)')
    }
    console.log('  - whyItems')

    mutations.push({ patch })
  }

  if (mutations.length === 0) {
    console.log('Inget att migrera — whyItems finns inte kvar i datasetet.')
    return
  }

  if (!write) {
    console.log(
      `\nTorrkörning: ${mutations.length} dokument skulle uppdateras.` +
        '\nKör "npm run migrate:why -- --write" för att spara.'
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
  console.log('Ladda om studion: varningen om okänt fält ska vara borta.')
}

main().catch((err) => {
  console.error(`\n${err.message}`)
  process.exit(1)
})
