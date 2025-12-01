import { Card } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  onTellMeMore?: () => void
}

export function MetricCard({ label, value, onTellMeMore }: MetricCardProps) {
  return (
    <Card className="rounded-[16px] border-[#f1f2f2] p-6 shadow-none">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-[var(--color-neutral-n-600)] font-['Poppins']">
            {label}
          </p>
          <p className="text-[32px] font-semibold text-[var(--color-neutral-n-800)] font-['Poppins'] leading-tight">
            {value}
          </p>
        </div>
        {onTellMeMore && (
          <button
            onClick={onTellMeMore}
            className="flex items-center gap-1 text-sm text-[var(--color-primary-p-500)] hover:text-[#3a6963] transition-colors font-['Poppins'] mt-1"
          >
            Tell Me More
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </Card>
  )
}
