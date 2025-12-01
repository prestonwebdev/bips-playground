import { LayoutDashboard, CreditCard, Landmark, X, Settings } from 'lucide-react'

interface MenuItem {
  icon: React.ReactNode
  label: string
  href: string
  active?: boolean
}

export default function Sidebar() {
  const menuItems: MenuItem[] = [
    {
      icon: <LayoutDashboard size={20} />,
      label: 'Overview',
      href: '/overview',
      active: true
    },
    {
      icon: <CreditCard size={20} />,
      label: 'Transactions',
      href: '/transactions'
    },
    {
      icon: <Landmark size={20} />,
      label: 'Linked Accounts',
      href: '/linked-accounts'
    }
  ]

  return (
    <div className="flex flex-col h-full w-full border-r border-[var(--color-neutral-g-100)] p-[var(--space-20)] gap-[var(--space-16)]">
      {/* Menu Top */}
      <div className="flex items-center justify-between px-[10px] py-2">
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-semibold">
            <span className="font-bold">bips</span>
          </div>
        </div>
        <button className="p-1 hover:bg-[var(--color-neutral-g-50)] rounded-lg transition-colors">
          <div className="w-6 h-6">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
              <rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        </button>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col flex-1 gap-3">
        {menuItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-[var(--space-16)] py-[10px] rounded-[var(--radius-full)] transition-colors ${
              item.active
                ? 'bg-[var(--color-neutral-g-50)] font-semibold'
                : 'hover:bg-[var(--color-neutral-g-50)] font-medium'
            }`}
          >
            <span className="flex-shrink-0 text-[var(--color-neutral-n-800)]">
              {item.icon}
            </span>
            <span className="text-[var(--color-neutral-n-800)] text-[16px] leading-[28px] tracking-[-0.32px] font-['Poppins']">
              {item.label}
            </span>
          </a>
        ))}
      </div>

      {/* Announcement Card */}
      <div className="relative bg-white border border-[var(--color-neutral-g-200)] rounded-[var(--radius-12)] h-[212px] overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="bg-[var(--color-neutral-g-50)] flex-1" />
          <div className="px-3 py-[10px] pt-1">
            <p className="text-[14px] font-semibold text-[var(--color-neutral-n-800)] leading-[28px] tracking-[-0.28px] font-['Poppins']">
              Company documents just launched!
            </p>
            <p className="text-[13px] font-normal text-[var(--color-neutral-n-600)] leading-[28px] tracking-[-0.26px] font-['Poppins']">
              See what's new
            </p>
          </div>
          <button className="absolute top-[13px] right-[6px] p-1 hover:bg-[var(--color-neutral-g-50)] rounded transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Company Info / Settings */}
      <div className="flex items-center justify-between px-1 py-[10px] rounded-[var(--space-8)] hover:bg-[var(--color-neutral-g-50)] transition-colors">
        <div className="flex items-center gap-[7px]">
          <div className="w-[44px] h-[44px] rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
            PP
          </div>
          <span className="text-[var(--color-neutral-n-800)] text-[16px] leading-[28px] tracking-[-0.32px] font-medium font-['Poppins']">
            Pied Piper
          </span>
        </div>
        <button className="p-1 hover:bg-[var(--color-neutral-g-100)] rounded transition-colors">
          <Settings size={18} />
        </button>
      </div>
    </div>
  )
}
