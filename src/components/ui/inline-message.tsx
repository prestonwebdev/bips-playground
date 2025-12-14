import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inlineMessageVariants = cva(
  'flex items-start gap-2 overflow-hidden px-3 py-4 rounded-xl text-[14px] leading-[20px] tracking-[-0.28px]',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-neutral-g-50)] text-[var(--color-neutral-n-800)]',
        info: 'bg-blue-50 text-blue-800',
        success: 'bg-green-50 text-green-800',
        warning: 'bg-yellow-50 text-yellow-800',
        error: 'bg-red-50 text-red-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface InlineMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof inlineMessageVariants> {
  /** Icon element or image source to display on the left */
  icon?: React.ReactNode
  /** Image source if using an image instead of an icon component */
  iconSrc?: string
  /** Alt text for the icon image */
  iconAlt?: string
}

const InlineMessage = React.forwardRef<HTMLDivElement, InlineMessageProps>(
  ({ className, variant, icon, iconSrc, iconAlt = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(inlineMessageVariants({ variant }), className)}
        {...props}
      >
        {iconSrc ? (
          <img src={iconSrc} alt={iconAlt} className="h-5 w-auto flex-shrink-0" />
        ) : icon ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
        <span>{children}</span>
      </div>
    )
  }
)
InlineMessage.displayName = 'InlineMessage'

export { InlineMessage, inlineMessageVariants }
