import { LucideIcon } from 'lucide-react'

interface ActionButtonProps {
  icon: LucideIcon
  label: string
  onClick?: () => void
  variant?: 'default' | 'outline'
  showBadge?: boolean
}

export function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = 'outline',
  showBadge = false,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-full transition-all font-['Poppins'] text-sm
        ${
          variant === 'default'
            ? 'bg-[#2D7A4B] text-white hover:bg-[#235d3a] shadow-sm'
            : 'border border-[#e5e7e7] text-[var(--color-neutral-n-700)] hover:bg-gray-50 bg-white'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      {showBadge && (
        <span className="w-2 h-2 rounded-full bg-[#c9a087]" />
      )}
      {label}
    </button>
  )
}
