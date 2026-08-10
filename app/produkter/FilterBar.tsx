'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

interface FilterBarProps {
  categories: [string, string][]
  current: string
  total: number
}

export default function FilterBar({ categories, current, total }: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setCategory(key: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (key === 'alla') {
      params.delete('kategori')
    } else {
      params.set('kategori', key)
    }
    router.push(`/produkter${params.toString() ? '?' + params.toString() : ''}`, { scroll: false })
  }

  return (
    <div className="flex items-center justify-between py-4 gap-6 overflow-x-auto">
      <div className="flex items-center gap-2 shrink-0">
        {categories.map(([key, label]) => {
          const active = current === key || (key === 'alla' && !current)
          return (
            <motion.button
              key={key}
              onClick={() => setCategory(key)}
              whileTap={{ scale: 0.95 }}
              className="relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 whitespace-nowrap"
              style={{
                color: active ? 'white' : 'var(--color-text-muted)',
                background: active ? 'var(--color-primary)' : 'transparent',
              }}
            >
              {label}
            </motion.button>
          )
        })}
      </div>
      <p className="text-sm shrink-0" style={{ color: 'var(--color-text-muted)' }}>
        {total} {total === 1 ? 'produkt' : 'produkter'}
      </p>
    </div>
  )
}
