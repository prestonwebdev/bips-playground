/**
 * UnicornAnimation - Embeds a Unicorn Studio animation
 */

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    UnicornStudio?: {
      isInitialized: boolean
      init: () => void
      destroy: () => void
    }
  }
}

interface UnicornAnimationProps {
  projectId: string
  width?: string | number
  height?: string | number
  className?: string
}

export function UnicornAnimation({
  projectId,
  width = '100%',
  height = 200,
  className = '',
}: UnicornAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    // Load the Unicorn Studio script if not already loaded
    if (!window.UnicornStudio && !scriptLoadedRef.current) {
      scriptLoadedRef.current = true
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.2/dist/unicornStudio.umd.js'
      script.onload = () => {
        if (window.UnicornStudio && !window.UnicornStudio.isInitialized) {
          window.UnicornStudio.init()
          window.UnicornStudio.isInitialized = true
        }
      }
      document.head.appendChild(script)
    } else if (window.UnicornStudio && !window.UnicornStudio.isInitialized) {
      window.UnicornStudio.init()
      window.UnicornStudio.isInitialized = true
    }

    // Re-init when component mounts with existing script
    const timer = setTimeout(() => {
      if (window.UnicornStudio) {
        window.UnicornStudio.init()
      }
    }, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [projectId])

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  return (
    <div
      ref={containerRef}
      data-us-project={projectId}
      style={style}
      className={className}
    />
  )
}
