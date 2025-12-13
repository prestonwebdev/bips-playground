import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollFadeEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  fadeHeight?: number
  fadeColor?: string
  /** Optional offset from top for the top fade (e.g., for sticky headers) */
  topFadeOffset?: number
}

const ScrollFadeEffect = React.forwardRef<HTMLDivElement, ScrollFadeEffectProps>(
  ({ className, children, fadeHeight = 40, fadeColor = "white", topFadeOffset = 0, ...props }, ref) => {
    const scrollRef = React.useRef<HTMLDivElement>(null)
    const [showTopFade, setShowTopFade] = React.useState(false)
    const [showBottomFade, setShowBottomFade] = React.useState(false)

    const checkScroll = React.useCallback(() => {
      const el = scrollRef.current
      if (!el) return

      const { scrollTop, scrollHeight, clientHeight } = el
      const isScrollable = scrollHeight > clientHeight

      setShowTopFade(isScrollable && scrollTop > 10)
      setShowBottomFade(isScrollable && scrollTop < scrollHeight - clientHeight - 10)
    }, [])

    React.useEffect(() => {
      const el = scrollRef.current
      if (!el) return

      // Initial check
      checkScroll()

      // Check on scroll
      el.addEventListener('scroll', checkScroll, { passive: true })

      // Check on resize
      const resizeObserver = new ResizeObserver(checkScroll)
      resizeObserver.observe(el)

      return () => {
        el.removeEventListener('scroll', checkScroll)
        resizeObserver.disconnect()
      }
    }, [checkScroll])

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        {/* Top fade */}
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 z-10 transition-opacity duration-200",
            showTopFade ? "opacity-100" : "opacity-0"
          )}
          style={{
            top: topFadeOffset,
            height: fadeHeight,
            background: `linear-gradient(to bottom, ${fadeColor} 0%, transparent 100%)`,
          }}
        />

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="h-full w-full overflow-auto"
        >
          {children}
        </div>

        {/* Bottom fade */}
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 z-10 transition-opacity duration-200",
            showBottomFade ? "opacity-100" : "opacity-0"
          )}
          style={{
            height: fadeHeight,
            background: `linear-gradient(to top, ${fadeColor} 0%, transparent 100%)`,
          }}
        />
      </div>
    )
  }
)

ScrollFadeEffect.displayName = "ScrollFadeEffect"

export { ScrollFadeEffect }
