/**
 * DevSelector - Minimal floating button for switching between dashboard versions
 *
 * Features:
 * - Small developer icon in bottom-right corner
 * - Expands to show version options on click
 * - Persists selection to localStorage
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Code2 } from 'lucide-react'

interface DevSelectorProps {
  currentVersion: string
  onVersionChange: (version: string) => void
}

const versions = [
  { id: 'v1', label: 'V1', description: 'Original' },
  { id: 'v2', label: 'V2', description: 'Current' },
  { id: 'v3', label: 'V3', description: 'Coming soon' },
]

export default function DevSelector({ currentVersion, onVersionChange }: DevSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleVersionClick = (version: string) => {
    onVersionChange(version)
    setIsOpen(false)
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 right-4 z-[1000] flex flex-col items-end gap-2"
    >
      {/* Version options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="flex flex-col gap-1 bg-white/95 backdrop-blur-sm rounded-lg border border-[var(--color-neutral-g-200)] shadow-lg p-1.5 min-w-[120px]"
          >
            {versions.map((version) => (
              <button
                key={version.id}
                onClick={() => handleVersionClick(version.id)}
                className={`flex items-center justify-between gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                  currentVersion === version.id
                    ? 'bg-[var(--color-primary-p-100)] text-[var(--color-primary-p-800)]'
                    : 'hover:bg-[var(--color-neutral-g-100)] text-[var(--color-neutral-n-700)]'
                }`}
              >
                <span className="text-sm font-medium font-['Poppins']">{version.label}</span>
                <span className="text-xs text-[var(--color-neutral-n-500)] font-['Poppins']">
                  {version.description}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`h-10 w-10 rounded-full flex items-center justify-center shadow-lg transition-colors ${
          isOpen
            ? 'bg-[var(--color-primary-p-500)] text-white'
            : 'bg-white/95 backdrop-blur-sm border border-[var(--color-neutral-g-200)] text-[var(--color-neutral-n-600)] hover:text-[var(--color-neutral-n-800)]'
        }`}
      >
        <Code2 className="h-5 w-5" />
      </motion.button>
    </div>
  )
}
