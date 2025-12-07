import { Utensils, Megaphone, Monitor, Wrench, Users, Zap, Home, Package, Shield, MoreHorizontal, LucideIcon } from 'lucide-react'
import { formatCurrencyDecimal, mockFinancialData } from '@/lib/mock-data'

interface SpendingItemDisplay {
  category: string
  amount: number
  percentage: number
  icon: LucideIcon
  color: string
}

interface TopSpendingV2Props {
  title?: string
  maxItems?: number
}

// Map category names to icons
const categoryIcons: Record<string, LucideIcon> = {
  'Equipment': Wrench,
  'Payroll': Users,
  'Marketing': Megaphone,
  'Utilities': Zap,
  'Rent': Home,
  'Supplies': Package,
  'Insurance': Shield,
  'Food': Utensils,
  'Software': Monitor,
  'Other': MoreHorizontal,
}

export function TopSpendingV2({
  title = 'Top Spending',
  maxItems = 7,
}: TopSpendingV2Props) {
  // Use mock data and transform it to include icons
  const spendingItems: SpendingItemDisplay[] = mockFinancialData.spendingData
    .slice(0, maxItems)
    .map(item => ({
      ...item,
      icon: categoryIcons[item.category] || MoreHorizontal,
    }))

  return (
    <div className="h-full">
      {/* Header */}
      <h3 className="text-[14px] font-medium text-black font-['Poppins'] mb-4">
        {title}
      </h3>

      {/* Spending items */}
      <div className="space-y-3">
        {spendingItems.map((item, index) => (
          <SpendingItemRow key={`${item.category}-${index}`} item={item} />
        ))}
      </div>
    </div>
  )
}

function SpendingItemRow({ item }: { item: SpendingItemDisplay }) {
  const Icon = item.icon

  return (
    <div className="flex items-center gap-3">
      {/* Icon and Category */}
      <div className="flex items-center gap-2 flex-shrink-0 w-24">
        <Icon className="w-4 h-4 text-[var(--color-neutral-n-600)]" />
        <span className="text-[13px] text-[var(--color-neutral-n-700)] font-['Poppins']">
          {item.category}
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex-1 h-2 bg-[#f1f2f2] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.min(item.percentage, 100)}%`,
            backgroundColor: '#2a4a47',
          }}
        />
      </div>

      {/* Amount */}
      <span className="text-[13px] font-medium text-[var(--color-neutral-n-700)] font-['Poppins'] flex-shrink-0 w-16 text-right">
        {formatCurrencyDecimal(item.amount)}
      </span>
    </div>
  )
}
