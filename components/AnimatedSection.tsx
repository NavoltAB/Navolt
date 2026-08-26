'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  once?: boolean
}

export default function AnimatedSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  once = true,
}: AnimatedSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '-8% 0px' })

  // The horizontal directions exist to animate two columns towards each other.
  // Below md there are no two columns — the grid has stacked — so the slide has
  // nothing to read against, and a 40px offset on a block that already fills the
  // 24px gutter pushes the page sideways for as long as it sits unseen below the
  // fold. On phones it becomes the same rise as everything else.
  const [stacked, setStacked] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => setStacked(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const axis =
    stacked && (direction === 'left' || direction === 'right') ? 'up' : direction

  const hidden = {
    opacity: 0,
    y: axis === 'up' ? 40 : axis === 'down' ? -40 : 0,
    x: axis === 'left' ? 40 : axis === 'right' ? -40 : 0,
  }

  return (
    <motion.div
      ref={ref}
      initial={hidden}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : hidden}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* Stagger container — wraps a list of StaggerItems.
   `stagger` is the gap between children. The 0.1s default suits the 2–4 item
   groups it was written for; long lists should pass something smaller, or the
   last item lands seconds after the first (25 logos × 0.1s = 2.4s). */
export function StaggerContainer({
  children,
  className = '',
  stagger = 0.1,
}: {
  children: React.ReactNode
  className?: string
  stagger?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-8% 0px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: stagger } } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
