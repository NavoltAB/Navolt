import {
  Anchor,
  Antenna,
  Battery,
  BatteryCharging,
  Cable,
  Caravan,
  Check,
  CircuitBoard,
  Compass,
  Fan,
  FileText,
  Flame,
  Gauge,
  Lightbulb,
  MessageCircle,
  Monitor,
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

import type { ServiceFeature } from '@/types/sanity'

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
  radar: Radar,
  vhf: Radio,
  antenn: Antenna,
  satellit: SatelliteDish,
  wifi: Wifi,
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
  { title: 'Radar', value: 'radar' },
  { title: 'VHF / radio', value: 'vhf' },
  { title: 'Antenn', value: 'antenn' },
  { title: 'Satellit', value: 'satellit' },
  { title: 'Wi-Fi / internet', value: 'wifi' },
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
 * Flattens whatever the array holds into `{ text, icon }`.
 *
 * `features` is a mixed array — bullets written before the icon field existed
 * are plain strings — and empty rows are common in a studio array, so this is
 * also where blanks get dropped.
 */
export function normalizeFeatures(
  features?: (ServiceFeature | string)[]
): { text: string; icon?: string }[] {
  if (!features) return []
  return features
    .map((f) => (typeof f === 'string' ? { text: f } : { text: f?.text ?? '', icon: f?.icon }))
    .filter((f) => f.text.trim().length > 0)
}
