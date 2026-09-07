/**
 * Shared by the basket form and /api/offert.
 *
 * A page file may only export the handful of names Next.js recognises, so this
 * cannot live in `app/(site)/varukorg/page.tsx` — and duplicating the two strings
 * in the route is how the form and the validator drift apart.
 */
export const DELIVERY_OPTIONS = ['Leverans', 'Hämtas'] as const
export type DeliveryOption = (typeof DELIVERY_OPTIONS)[number]
