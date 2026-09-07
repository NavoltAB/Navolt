'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { missingKits, type CartItem, type CartLine, type MissingKit } from '@/lib/cart'

export { missingKits }
export type { CartItem, CartLine, MissingKit }

const STORAGE_KEY = 'navolt-varukorg'

/**
 * The basket holds enough to render itself without another Sanity round trip —
 * name, price, unit and a thumbnail URL — so /varukorg is a pure client page and
 * opens instantly. The slug is the identity; everything else is a snapshot.
 *
 * A snapshot can go stale if a product is renamed or repriced between adding
 * and sending. That's deliberate: the basket is an enquiry, not an order, and
 * the price is quoted back by a human who reads the current catalogue anyway.
 */
interface CartContextValue {
  items: CartItem[]
  /** False until localStorage has been read. Guards against rendering a count
   *  on the server that the client immediately contradicts. */
  ready: boolean
  addItem: (item: CartItem) => void
  removeItem: (slug: string) => void
  setQuantity: (slug: string, quantity: number) => void
  clearCart: () => void
  /** Total pieces, not distinct products — the badge should tick up when you
   *  add a second of something you already have. */
  count: number
  has: (slug: string) => boolean
}

const CartContext = createContext<CartContextValue | null>(null)

export const MAX_QTY = 99

const clamp = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.round(n) || 1))

// localStorage is user-writable and survives deploys, so anything coming out of
// it is treated as hostile: one bad row is dropped rather than crashing the
// basket, and a corrupt payload just yields an empty cart.
function parse(raw: string): CartItem[] {
  const data: unknown = JSON.parse(raw)
  if (!Array.isArray(data)) return []
  return data.flatMap((entry): CartItem[] => {
    if (typeof entry !== 'object' || entry === null) return []
    const { slug, name, quantity, price, unit, image, kit } = entry as Record<string, unknown>
    if (typeof slug !== 'string' || !slug || typeof name !== 'string' || !name) return []
    return [
      {
        slug,
        name,
        quantity: clamp(typeof quantity === 'number' ? quantity : 1),
        price: typeof price === 'number' ? price : undefined,
        unit: typeof unit === 'string' ? unit : undefined,
        image: typeof image === 'string' ? image : undefined,
        kit: parseLine(kit),
      },
    ]
  })
}

/** Same hostile treatment as the rows themselves: a malformed kit is dropped,
 *  it never takes the cart down with it. */
function parseLine(value: unknown): CartLine | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const { slug, name, price, unit, image } = value as Record<string, unknown>
  if (typeof slug !== 'string' || !slug || typeof name !== 'string' || !name) return undefined
  return {
    slug,
    name,
    price: typeof price === 'number' ? price : undefined,
    unit: typeof unit === 'string' ? unit : undefined,
    image: typeof image === 'string' ? image : undefined,
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(parse(stored))
    } catch {
      // Private browsing, quota, or a corrupt payload — start empty.
    }
    setReady(true)
  }, [])

  useEffect(() => {
    // Skipped until the initial read has happened, or the empty starting state
    // would overwrite a stored basket before it's been loaded.
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items, ready])

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === item.slug)
      // Adding something already in the basket tops up the quantity rather than
      // replacing it — "add 2" twice means 4, which is what the button says.
      if (existing) {
        return prev.map((i) =>
          i.slug === item.slug
            ? { ...i, quantity: clamp(i.quantity + item.quantity), kit: item.kit ?? i.kit }
            : i
        )
      }
      return [...prev, { ...item, quantity: clamp(item.quantity) }]
    })
  }, [])

  const removeItem = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug))
  }, [])

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => (i.slug === slug ? { ...i, quantity: clamp(quantity) } : i))
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ready,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      has: (slug: string) => items.some((i) => i.slug === slug),
    }),
    [items, ready, addItem, removeItem, setQuantity, clearCart]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart måste användas inom en CartProvider')
  return ctx
}
