/**
 * SmartTooltip - A flexible, portal-based tooltip component with smart positioning
 *
 * Features:
 * - Auto-positions above trigger element, falls back to below if no room
 * - Handles viewport edge overflow (left, right, top)
 * - Light and dark variants for different use cases
 * - Smooth animations with motion.dev
 * - Portal-based rendering to avoid overflow clipping
 *
 * Usage:
 * - Dark variant: buttons, navigation, action items
 * - Light variant: informational overlays, charts, data breakdowns
 */

import { useRef, useState, useLayoutEffect } from 'react'
import { motion } from 'motion/react'
import { createPortal } from 'react-dom'

export interface SmartTooltipProps {
  /** Content to display inside the tooltip */
  children: React.ReactNode
  /** Bounding rect of the trigger element (from getBoundingClientRect) */
  triggerRect: DOMRect | null
  /** Visual variant - dark for buttons/nav, light for informational content */
  variant?: 'dark' | 'light'
  /** Optional className for additional styling */
  className?: string
}

const TOOLTIP_STYLES = {
  dark: 'bg-[var(--color-neutral-n-800)] shadow-xl',
  light: 'bg-white/90 backdrop-blur-[3px] border border-[var(--color-neutral-g-100)] shadow-[0px_5px_13px_0px_rgba(0,0,0,0.04),0px_20px_24px_0px_rgba(0,0,0,0.06)]',
} as const

/**
 * SmartTooltip Component
 *
 * A portal-based tooltip that automatically positions itself above the trigger
 * element and handles viewport edge cases gracefully.
 *
 * @example
 * // Dark variant for action buttons
 * <SmartTooltip triggerRect={buttonRect} variant="dark">
 *   <span className="text-white">Click to view</span>
 * </SmartTooltip>
 *
 * @example
 * // Light variant for chart data
 * <SmartTooltip triggerRect={chartPointRect} variant="light">
 *   <div className="text-neutral-800">
 *     <div className="font-medium">Revenue</div>
 *     <div>$10,000</div>
 *   </div>
 * </SmartTooltip>
 */
export function SmartTooltip({
  children,
  triggerRect,
  variant = 'light',
  className = '',
}: SmartTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useLayoutEffect(() => {
    if (!triggerRect || !tooltipRef.current) return

    const tooltip = tooltipRef.current
    const tooltipRect = tooltip.getBoundingClientRect()

    // Calculate centered position above the trigger
    let x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
    let y = triggerRect.top - tooltipRect.height - 8 // 8px gap above trigger

    // Ensure tooltip doesn't overflow left edge
    if (x < 8) {
      x = 8
    }

    // Ensure tooltip doesn't overflow right edge
    if (x + tooltipRect.width > window.innerWidth - 8) {
      x = window.innerWidth - tooltipRect.width - 8
    }

    // If tooltip would go above viewport, show below instead
    if (y < 8) {
      y = triggerRect.bottom + 8
    }

    setPosition({ x, y })
  }, [triggerRect])

  if (!triggerRect) return null

  return createPortal(
    <motion.div
      ref={tooltipRef}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 9999,
      }}
      className={`rounded-lg px-3 py-2 whitespace-nowrap ${TOOLTIP_STYLES[variant]} ${className}`}
    >
      {children}
    </motion.div>,
    document.body
  )
}

/**
 * Hook to manage tooltip trigger state
 *
 * @example
 * const { isVisible, triggerRect, triggerRef, showTooltip, hideTooltip } = useTooltipTrigger()
 *
 * <button
 *   ref={triggerRef}
 *   onMouseEnter={showTooltip}
 *   onMouseLeave={hideTooltip}
 * >
 *   Hover me
 * </button>
 *
 * <AnimatePresence>
 *   {isVisible && triggerRect && (
 *     <SmartTooltip triggerRect={triggerRect}>Content</SmartTooltip>
 *   )}
 * </AnimatePresence>
 */
export function useTooltipTrigger<T extends HTMLElement = HTMLElement>(delay = 0) {
  const [isVisible, setIsVisible] = useState(false)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)
  const triggerRef = useRef<T>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const showTooltip = () => {
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        if (triggerRef.current) {
          setTriggerRect(triggerRef.current.getBoundingClientRect())
        }
        setIsVisible(true)
      }, delay)
    } else {
      if (triggerRef.current) {
        setTriggerRect(triggerRef.current.getBoundingClientRect())
      }
      setIsVisible(true)
    }
  }

  const hideTooltip = () => {
    setIsVisible(false)
    setTriggerRect(null)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  return {
    isVisible,
    triggerRect,
    triggerRef,
    showTooltip,
    hideTooltip,
  }
}

export default SmartTooltip
