import { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform, useInView } from 'motion/react'

interface AnimatedNumberProps {
  value: number
  format?: 'compact' | 'full'
  className?: string
  duration?: number
  animate?: boolean
}

/**
 * AnimatedNumber - Ticker animation component
 *
 * Displays a number with a smooth counting animation when it comes into view.
 * Uses motion.dev's spring animations for a natural feel.
 */
export function AnimatedNumber({
  value,
  format = 'compact',
  className = '',
  duration = 0.6,
  animate = true,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [hasAnimated, setHasAnimated] = useState(false)

  // Spring animation for smooth counting - faster and snappier
  const springValue = useSpring(animate ? 0 : value, {
    stiffness: 200,
    damping: 30,
    duration: duration * 1000,
  })

  // Transform the spring value to our target
  const displayValue = useTransform(springValue, (latest) => {
    const rounded = Math.round(latest)
    return formatNumber(rounded, format)
  })

  useEffect(() => {
    if (!animate) {
      springValue.set(value)
      return
    }
    if (isInView && !hasAnimated) {
      springValue.set(value)
      setHasAnimated(true)
    }
  }, [isInView, value, springValue, hasAnimated, animate])

  // Reset animation when value changes significantly
  useEffect(() => {
    if (hasAnimated || !animate) {
      springValue.set(value)
    }
  }, [value, springValue, hasAnimated, animate])

  return (
    <motion.span
      ref={ref}
      className={className}
    >
      {displayValue}
    </motion.span>
  )
}

function formatNumber(num: number, format: 'compact' | 'full'): string {
  if (format === 'compact') {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `$${Math.round(num / 1000)}K`
    }
    return `$${num}`
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * AnimatedDigits - Alternative digit-by-digit animation
 *
 * Each digit rolls independently for a slot-machine effect.
 */
export function AnimatedDigits({
  value,
  className = '',
}: {
  value: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <div ref={ref} className={`flex overflow-hidden ${className}`}>
      {value.split('').map((char, index) => (
        <AnimatedDigit
          key={`${index}-${char}`}
          char={char}
          delay={index * 0.05}
          animate={isInView}
        />
      ))}
    </div>
  )
}

function AnimatedDigit({
  char,
  delay,
  animate,
}: {
  char: string
  delay: number
  animate: boolean
}) {
  const isNumber = /\d/.test(char)

  if (!isNumber) {
    return <span>{char}</span>
  }

  const digit = parseInt(char, 10)

  return (
    <div className="relative h-[1.2em] overflow-hidden">
      <motion.div
        initial={{ y: '100%' }}
        animate={animate ? { y: `-${digit * 10}%` } : { y: '100%' }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 20,
          delay,
        }}
        className="flex flex-col"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="h-[1.2em] flex items-center justify-center">
            {n}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
