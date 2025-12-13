import * as React from "react"
import { cn } from "@/lib/utils"

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ghost' | 'default'
}

/**
 * IconButton - Circular button for icons
 *
 * Used for action buttons like hide/show, navigation arrows, etc.
 * Features a circular shape with hover background effect.
 */
const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, children, size = 'md', variant = 'default', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-7 w-7',
      md: 'h-8 w-8',
      lg: 'h-10 w-10',
    }

    const variantClasses = {
      default: 'bg-[var(--color-neutral-g-100)] hover:bg-[var(--color-neutral-g-200)]',
      ghost: 'bg-transparent hover:bg-[var(--color-neutral-g-100)]',
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-colors",
          "text-[var(--color-neutral-n-600)] hover:text-[var(--color-neutral-n-800)]",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

IconButton.displayName = "IconButton"

export { IconButton }
