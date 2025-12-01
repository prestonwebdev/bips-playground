import { formatCurrencyDecimal } from '@/lib/mock-data'

interface SpendingListItemProps {
  category: string
  percentage: number
  amount?: number
  color?: string
}

export function SpendingListItem({
  category,
  percentage,
  amount,
  color = '#2D7A4B',
}: SpendingListItemProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Category indicator dot */}
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Category name */}
      <span className="text-sm text-[var(--color-neutral-n-700)] font-['Poppins'] flex-shrink-0 w-24">
        {category}
      </span>

      {/* Progress bar */}
      <div className="flex-1 h-2 bg-[#f1f2f2] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>

      {/* Amount */}
      {amount !== undefined && (
        <span className="text-sm text-[var(--color-neutral-n-700)] font-medium font-['Poppins'] flex-shrink-0 w-20 text-right">
          {formatCurrencyDecimal(amount)}
        </span>
      )}

      {/* Percentage */}
      <span className="text-sm text-[var(--color-neutral-n-600)] font-['Poppins'] flex-shrink-0 w-10 text-right">
        {percentage}%
      </span>
    </div>
  )
}
