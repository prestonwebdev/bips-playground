import { Card } from '@/components/ui/card'
import { SpendingListItem } from './SpendingListItem'

interface SpendingItem {
  category: string
  percentage: number
  amount?: number
  color?: string
}

interface SpendingListProps {
  items: SpendingItem[]
  title?: string
}

export function SpendingList({
  items,
  title = 'Top Spending',
}: SpendingListProps) {
  return (
    <Card className="rounded-[16px] border-[#f1f2f2] p-6 shadow-none h-full">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-[18px] font-medium text-[#8d9291] font-['Poppins']">
          {title}
        </h3>
      </div>

      {/* List */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <SpendingListItem
            key={`${item.category}-${index}`}
            category={item.category}
            percentage={item.percentage}
            amount={item.amount}
            color={item.color}
          />
        ))}
      </div>
    </Card>
  )
}
