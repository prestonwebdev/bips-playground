import { LucideIcon, DollarSign, Wallet, FileSpreadsheet } from 'lucide-react'
import { AnimatedNumber } from './AnimatedNumber'

interface SummaryTileV2Props {
  type: 'revenue' | 'costs' | 'profit'
  label: string
  value: number
  className?: string
}

const iconMap: Record<string, LucideIcon> = {
  revenue: DollarSign,
  costs: Wallet,
  profit: FileSpreadsheet,
}

const colorMap: Record<string, { icon: string; value: string; bg: string }> = {
  revenue: {
    icon: '#467c75',
    value: 'text-black',
    bg: 'bg-[#467c75]/10',
  },
  costs: {
    icon: '#b68b69',
    value: 'text-[#b68b69]',
    bg: 'bg-[#b68b69]/10',
  },
  profit: {
    icon: '#467c75',
    value: 'text-[#467c75]',
    bg: 'bg-[#467c75]/10',
  },
}

export function SummaryTileV2({ type, label, value, className = '' }: SummaryTileV2Props) {
  const Icon = iconMap[type]
  const colors = colorMap[type]

  return (
    <div className={`flex items-center gap-4 bg-white rounded-[12px] border border-[var(--color-neutral-g-100)] px-5 py-4 ${className}`}>
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.bg}`}
      >
        <Icon className="w-5 h-5" style={{ color: colors.icon }} />
      </div>

      {/* Label and Value */}
      <div className="flex items-center gap-3">
        <span className="text-[14px] text-[var(--color-neutral-n-600)] font-['Poppins']">
          {label}
        </span>
        <AnimatedNumber
          value={value}
          className={`text-[28px] font-semibold font-['Poppins'] leading-tight tracking-[-0.56px] ${colors.value}`}
          format="full"
        />
      </div>
    </div>
  )
}
