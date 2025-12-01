import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type ViewType = 'Month' | 'Quarter' | 'Year'

interface DateRangeSelectorProps {
  selectedDate?: string
  onDateChange?: (date: string) => void
  defaultView?: ViewType
  onViewChange?: (view: ViewType) => void
}

export function DateRangeSelector({
  selectedDate = 'August 2025',
  onDateChange,
  defaultView = 'Month',
  onViewChange,
}: DateRangeSelectorProps) {
  const [view, setView] = useState<ViewType>(defaultView)

  const handleViewChange = (newView: ViewType) => {
    setView(newView)
    onViewChange?.(newView)
  }

  return (
    <div className="flex items-center justify-between w-full">
      {/* Date Selector */}
      <button
        onClick={() => onDateChange?.(selectedDate)}
        className="flex items-center gap-2 text-[24px] font-semibold text-[var(--color-neutral-n-800)] hover:opacity-80 transition-opacity font-['Poppins']"
      >
        {selectedDate}
        <ChevronDown className="w-5 h-5" />
      </button>

      {/* View Toggle */}
      <div className="flex items-center bg-[#fafafa] rounded-full p-1 border border-[#f1f2f2]">
        {(['Month', 'Quarter', 'Year'] as ViewType[]).map((viewType) => (
          <button
            key={viewType}
            onClick={() => handleViewChange(viewType)}
            className={`
              px-4 py-1.5 text-sm rounded-full transition-all font-['Poppins'] font-medium
              ${
                view === viewType
                  ? 'bg-[var(--color-primary-p-500)] text-white shadow-sm'
                  : 'text-[var(--color-neutral-n-600)] hover:text-[var(--color-neutral-n-800)]'
              }
            `}
          >
            {viewType}
          </button>
        ))}
      </div>
    </div>
  )
}
