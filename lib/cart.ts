/**
 * The basket's data shape and the one rule that reads it.
 *
 * Kept out of CartContext so it is plain TypeScript: no provider to mount, no
 * React to render, and the kit arithmetic can be checked on its own.
 */

/** Enough of a product to render a row and, for a ruta, to offer its kit. */
export interface CartLine {
  slug: string
  name: string
  price?: number
  unit?: string
  image?: string
}

export interface CartItem extends CartLine {
  quantity: number
  /**
   * The monteringspaket this specific ruta requires, snapshotted at add time
   * like the price and the name beside it. It can therefore go stale if the
   * pairing is changed in the studio afterwards — the same deliberate tradeoff
   * the rest of this snapshot makes, and the reason /varukorg needs no round trip.
   */
  kit?: CartLine
}

export type MissingKit = {
  kit: CartLine
  /** How many the basket implies, summed across every ruta asking for it. */
  needed: number
  inCart: number
}

/**
 * Which monteringspaket the basket is short of.
 *
 * One kit per ruta, so quantities add up: two rutor of the same type want two
 * kits. Where several *different* rutor happen to point at the same kit their
 * demands are summed too — under-ordering a part the installation cannot
 * proceed without is the worse failure, and the stepper in varukorgen makes
 * correcting it one click. Nothing here blocks a submit: a customer who already
 * owns the kit, or whose yard supplies it, must still be able to order.
 */
export function missingKits(items: CartItem[]): MissingKit[] {
  const demand = new Map<string, { kit: CartLine; needed: number }>()
  for (const item of items) {
    if (!item.kit) continue
    // A kit that is itself in the basket as a normal line must not also count
    // as demanding itself.
    if (item.kit.slug === item.slug) continue
    const seen = demand.get(item.kit.slug)
    if (seen) seen.needed += item.quantity
    else demand.set(item.kit.slug, { kit: item.kit, needed: item.quantity })
  }

  return [...demand.values()]
    .map(({ kit, needed }) => ({
      kit,
      needed,
      inCart: items.find((i) => i.slug === kit.slug)?.quantity ?? 0,
    }))
    .filter((row) => row.inCart < row.needed)
}
