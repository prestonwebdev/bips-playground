/**
 * AnimatedChevron - A chevron icon that animates to a minus when open
 *
 * Used in dropdowns and expandable sections throughout the app.
 * Smoothly morphs between chevron (▼) and minus (—) states.
 */

import { motion } from 'motion/react'

interface AnimatedChevronProps {
  /** Whether the associated dropdown/section is open */
  isOpen: boolean
  /** Size of the icon in pixels (default: 20) */
  size?: number
  /** Additional CSS classes */
  className?: string
  /** Direction the chevron points when closed (default: 'down') */
  direction?: 'up' | 'down'
}

export function AnimatedChevron({
  isOpen,
  size = 20,
  className = '',
  direction = 'down'
}: AnimatedChevronProps) {
  // SVG path for chevron pointing down
  const chevronDown = "M18 9L12 15L6 9"
  // SVG path for chevron pointing up
  const chevronUp = "M18 15L12 9L6 15"
  // SVG path for minus/horizontal line
  const minus = "M18 12L12 12L6 12"

  const chevronPath = direction === 'down' ? chevronDown : chevronUp

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`text-[var(--color-neutral-n-700)] ${className}`}
    >
      <motion.path
        d={chevronPath}
        animate={{ d: isOpen ? minus : chevronPath }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default AnimatedChevron
