/**
 * One-shot seed: uploads the logos in /public/brands to Sanity as `brand`
 * documents, so the customer can manage the list in the Studio from day one.
 *
 *   npm run seed:brands
 *
 * Needs SANITY_API_WRITE_TOKEN in .env.local (Manage > API > Tokens, Editor).
 *
 * Safe to re-run: documents use deterministic ids and Sanity dedupes image
 * assets by content hash, so a second run overwrites rather than duplicating.
 *
 * The list below mirrors `defaultBrands` in components/Brands.tsx.
 */
import { readFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const brands = [
  { name: 'B&G', file: 'bochg.png' },
  { name: 'BEP', file: 'bep.png' },
  { name: 'Blue Sea Systems', file: 'blue-sea-systems.png' },
  { name: 'Dometic', file: 'dometic.png' },
  { name: 'Eberspächer', file: 'eberspacher.png' },
  { name: 'Fusion', file: 'fusion.png' },
  { name: 'Garmin', file: 'garmin.png' },
  { name: 'Isotemp', file: 'isotemp.png' },
  { name: 'Isotherm', file: 'isotherm.png' },
  { name: 'Lewmar', file: 'lewmar.png', scale: 1.85 },
  { name: 'Lowrance', file: 'lowrance.png' },
  { name: 'Mastervolt', file: 'mastervolt-ny.png' },
  { name: 'Nexa', file: 'nexa.png' },
  { name: 'Nordmax', file: 'nordmax.png' },
  { name: 'Quick', file: 'quick.png' },
  { name: 'Raymarine', file: 'raymarine.png' },
  { name: 'Renogy', file: 'renogy.png' },
  { name: 'Sika', file: 'sika.png' },
  { name: 'Simrad', file: 'simrad.png' },
  { name: 'Skanbatt', file: 'skanbatt.jpg' },
  { name: 'Skyllermarks', file: 'skyllermarks.png' },
  { name: 'Sleipner', file: 'sleipner.jpg', scale: 1.7 },
  { name: 'Sutars', file: 'sutars.png' },
  { name: 'Teltonika', file: 'teltonika.png' },
  { name: 'Victron Energy', file: 'victron-energy.png' },
]

// Minimal .env.local reader — avoids pulling in dotenv for a one-shot script.
function loadEnv() {
  const envPath = path.join(root, '.env.local')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
    }
  }
}

loadEnv()

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !token) {
  console.error(
    'Missing config. Need NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local.\n' +
      'Create a write token at https://sanity.io/manage > your project > API > Tokens (role: Editor).'
  )
  process.exit(1)
}

const api = `https://${projectId}.api.sanity.io/v2024-01-01`
const authHeader = { Authorization: `Bearer ${token}` }

// Turns 'Blue Sea Systems' into 'brand-blue-sea-systems' so re-runs replace
// rather than pile up duplicates.
function documentId(name) {
  const slug = name
    .toLowerCase()
    .replace(/&/g, 'och')
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `brand-${slug}`
}

async function uploadLogo(file) {
  const body = await readFile(path.join(root, 'public', 'brands', file))
  const contentType = file.endsWith('.jpg') || file.endsWith('.jpeg') ? 'image/jpeg' : 'image/png'

  const res = await fetch(`${api}/assets/images/${dataset}?filename=${encodeURIComponent(file)}`, {
    method: 'POST',
    headers: { ...authHeader, 'Content-Type': contentType },
    body,
  })

  if (!res.ok) {
    throw new Error(`Upload of ${file} failed (${res.status}): ${await res.text()}`)
  }
  const { document } = await res.json()
  return document._id
}

async function main() {
  const mutations = []

  for (const [index, brand] of brands.entries()) {
    process.stdout.write(`  ${String(index + 1).padStart(2)}/${brands.length}  ${brand.name}… `)
    const assetId = await uploadLogo(brand.file)
    console.log('ok')

    mutations.push({
      createOrReplace: {
        _id: documentId(brand.name),
        _type: 'brand',
        name: brand.name,
        logo: { _type: 'image', asset: { _type: 'reference', _ref: assetId } },
        scale: brand.scale ?? 1,
        // Spaced by 10 so the customer can slot a new brand between two
        // existing ones without renumbering the whole list.
        order: (index + 1) * 10,
      },
    })
  }

  const res = await fetch(`${api}/data/mutate/${dataset}`, {
    method: 'POST',
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mutations }),
  })

  if (!res.ok) {
    throw new Error(`Creating brand documents failed (${res.status}): ${await res.text()}`)
  }

  console.log(`\nDone — ${brands.length} brands in the "${dataset}" dataset.`)
  console.log('Check them at http://localhost:3000/studio under Varumärken.')
}

main().catch((err) => {
  console.error(`\n${err.message}`)
  process.exit(1)
})
