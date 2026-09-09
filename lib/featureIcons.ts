import {
  Activity,
  Anchor,
  Antenna,
  Battery,
  BatteryCharging,
  Cable,
  Caravan,
  Check,
  CircuitBoard,
  Cog,
  Compass,
  Droplet,
  Fan,
  FileText,
  Flame,
  Fuel,
  Gauge,
  Lightbulb,
  MessageCircle,
  Monitor,
  Network,
  PencilRuler,
  Plug,
  PlugZap,
  Power,
  Radar,
  Radio,
  Refrigerator,
  Sailboat,
  SatelliteDish,
  Search,
  Ship,
  ShipWheel,
  ShieldCheck,
  Snowflake,
  Sun,
  Thermometer,
  Truck,
  WavesHorizontal,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react'

import type { ServiceFeatureHeading, ServiceFeatureItem } from '@/types/sanity'

/**
 * The icons an editor can put in front of a "Vad ingår" bullet.
 *
 * One curated list, used in two places: the dropdown in the studio
 * (sanity/schemas/service.ts, which also renders the icon in the array item's
 * preview) and the rendered list (components/FeatureList.tsx). Adding an icon
 * therefore means adding it here and nowhere else.
 *
 * Keep it curated. lucide ships thousands of icons; a dropdown of thousands is
 * a dropdown nobody reads. These are the ones a marine-electronics bullet
 * actually needs — if a service wants something that isn't here, add that one
 * icon rather than opening the whole set.
 *
 * The keys are stored in Sanity, so treat them as content: rename a key and
 * every document using it falls back to the default icon.
 */
export const featureIcons = {
  check: Check,
  sol: Sun,
  batteri: Battery,
  batteritest: Activity,
  laddning: BatteryCharging,
  landstrom: PlugZap,
  el: Zap,
  kontakt: Plug,
  strom: Power,
  kabel: Cable,
  krets: CircuitBoard,
  matning: Gauge,
  overvakning: Monitor,
  navigation: Compass,
  ratt: ShipWheel,
  radar: Radar,
  vhf: Radio,
  antenn: Antenna,
  satellit: SatelliteDish,
  wifi: Wifi,
  natverk: Network,
  varme: Thermometer,
  kyla: Snowflake,
  kylskap: Refrigerator,
  panna: Flame,
  flakt: Fan,
  belysning: Lightbulb,
  ankare: Anchor,
  bat: Sailboat,
  fartyg: Ship,
  vatten: WavesHorizontal,
  campervan: Caravan,
  transport: Truck,
  service: Wrench,
  motor: Cog,
  olja: Droplet,
  bransle: Fuel,
  felsokning: Search,
  garanti: ShieldCheck,
  ritning: PencilRuler,
  dokument: FileText,
  radgivning: MessageCircle,
} as const satisfies Record<string, LucideIcon>

export type FeatureIconName = keyof typeof featureIcons

/** Swedish labels for the studio dropdown — same order as the map above. */
export const featureIconOptions: { title: string; value: FeatureIconName }[] = [
  { title: 'Bock (standard)', value: 'check' },
  { title: 'Sol / solceller', value: 'sol' },
  { title: 'Batteri', value: 'batteri' },
  { title: 'Batteritest / hälsa', value: 'batteritest' },
  { title: 'Laddning', value: 'laddning' },
  { title: 'Landström', value: 'landstrom' },
  { title: 'El / blixt', value: 'el' },
  { title: 'Uttag', value: 'kontakt' },
  { title: 'Strömbrytare', value: 'strom' },
  { title: 'Kabel', value: 'kabel' },
  { title: 'Kretskort', value: 'krets' },
  { title: 'Mätning / instrument', value: 'matning' },
  { title: 'Övervakning / skärm', value: 'overvakning' },
  { title: 'Navigation / kompass', value: 'navigation' },
  { title: 'Autopilot / ratt', value: 'ratt' },
  { title: 'Radar', value: 'radar' },
  { title: 'VHF / radio', value: 'vhf' },
  { title: 'Antenn', value: 'antenn' },
  { title: 'Satellit', value: 'satellit' },
  { title: 'Wi-Fi / internet', value: 'wifi' },
  { title: 'Nätverk ombord (NMEA)', value: 'natverk' },
  { title: 'Värme', value: 'varme' },
  { title: 'Kyla', value: 'kyla' },
  { title: 'Kylskåp', value: 'kylskap' },
  { title: 'Värmepanna', value: 'panna' },
  { title: 'Fläkt / ventilation', value: 'flakt' },
  { title: 'Belysning', value: 'belysning' },
  { title: 'Ankarspel', value: 'ankare' },
  { title: 'Båt', value: 'bat' },
  { title: 'Fartyg', value: 'fartyg' },
  { title: 'Vatten', value: 'vatten' },
  { title: 'Campervan', value: 'campervan' },
  { title: 'Transport', value: 'transport' },
  { title: 'Service / verktyg', value: 'service' },
  { title: 'Motor / mekanik', value: 'motor' },
  { title: 'Olja / vätska', value: 'olja' },
  { title: 'Bränsle', value: 'bransle' },
  { title: 'Felsökning', value: 'felsokning' },
  { title: 'Garanti', value: 'garanti' },
  { title: 'Ritning / kopplingsschema', value: 'ritning' },
  { title: 'Dokument', value: 'dokument' },
  { title: 'Rådgivning', value: 'radgivning' },
]

/** The icon a bullet gets when the editor hasn't picked one. */
export const DEFAULT_FEATURE_ICON: FeatureIconName = 'check'

export function featureIcon(name?: string): LucideIcon {
  return (name && featureIcons[name as FeatureIconName]) || featureIcons[DEFAULT_FEATURE_ICON]
}

/**
 * Splits a bullet written "Etikett - beskrivning" into its two halves.
 *
 * The label is the part a reader scans for, so it is set apart from the
 * sentence that follows it. Only a short leading fragment counts: a dash
 * further into the text is punctuation in an ordinary sentence, not a label,
 * and the bullet is then left whole. The separator has to be spaced, so
 * "Wi-Fi" and "Kyla/Värme" survive intact.
 */
export function splitFeature(text: string): { label?: string; body: string } {
  const match = text.trim().match(/^(.{2,32}?) [-–—] ([\s\S]+)$/)
  return match ? { label: match[1].trim(), body: match[2].trim() } : { body: text.trim() }
}

/**
 * Flattens the bullets into `{ text, icon }`.
 *
 * `features` is a mixed array — bullets written before the icon field existed
 * are plain strings, and category headings share the array with them — and
 * empty rows are common in a studio array, so this is where headings and
 * blanks are dropped. Use `groupFeatures` where the categories matter.
 */
export function normalizeFeatures(features?: ServiceFeatureItem[]): NormalizedFeature[] {
  if (!features) return []
  return features
    .flatMap<NormalizedFeature>((f) => {
      if (isFeatureHeading(f)) return []
      return typeof f === 'string' ? [{ text: f }] : [{ text: f?.text ?? '', icon: f?.icon }]
    })
    .filter((f) => f.text.trim().length > 0)
}

export interface NormalizedFeature {
  text: string
  icon?: string
}

export interface FeatureGroup {
  /** Absent for the bullets standing above the first heading. */
  title?: string
  items: NormalizedFeature[]
}

/** A category heading rather than a bullet — see ServiceFeatureHeading. */
export function isFeatureHeading(item: ServiceFeatureItem): item is ServiceFeatureHeading {
  return (
    typeof item === 'object' &&
    item !== null &&
    (item as ServiceFeatureHeading)._type === 'featureGroup'
  )
}

/**
 * Folds the flat array into the categories the page renders.
 *
 * A heading opens a group and every bullet after it falls into that one;
 * bullets standing before any heading make an untitled group, which is what an
 * uncategorised service consists of entirely — so a document nobody has
 * categorised comes back as a single group and renders exactly as before.
 *
 * A heading with no bullets under it is dropped rather than left as a lone
 * title, the same rule the service page applies to its empty sections: a
 * half-finished edit in the studio shouldn't look broken on the site.
 */
export function groupFeatures(features?: ServiceFeatureItem[]): FeatureGroup[] {
  if (!features) return []

  const groups: FeatureGroup[] = []
  for (const item of features) {
    if (isFeatureHeading(item)) {
      const title = item.title?.trim()
      if (title) groups.push({ title, items: [] })
      continue
    }
    const [normalized] = normalizeFeatures([item])
    if (!normalized) continue
    if (groups.length === 0) groups.push({ items: [] })
    groups[groups.length - 1].items.push(normalized)
  }

  return groups.filter((group) => group.items.length > 0)
}
