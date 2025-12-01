import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { AnimatedNumber } from './AnimatedNumber'
import { type FinancialPeriod } from '@/lib/quarterly-data'
import {
  CreditCard,
  Wallet,
  FileText,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  monthlyFinancialData,
  quarterlyFinancialData,
  yearlyFinancialData,
} from '@/lib/quarterly-data'

interface FinancialCardProps {
  data: FinancialPeriod
  direction?: 'left' | 'right'
  viewType: 'month' | 'quarter' | 'year'
  onViewChange?: (view: 'month' | 'quarter' | 'year') => void
  onNavigate?: (direction: 'prev' | 'next') => void
  onPeriodSelect?: (periodId: string) => void
  hasPrev?: boolean
  hasNext?: boolean
}

/**
 * FinancialCard - Financial snapshot with animated transitions
 *
 * Layout matches Figma design:
 * - Top row: Navigation arrows (left) | View selector (right)
 * - Card content: Period label, large revenue number, insight, metric cards, progress bar
 * - Bottom: Action pills
 */
export function FinancialCard({
  data,
  direction = 'right',
  viewType,
  onViewChange,
  onNavigate,
  onPeriodSelect,
  hasPrev = true,
  hasNext = true,
}: FinancialCardProps) {
  // Animation variants for content transitions
  const contentVariants = {
    enter: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? 60 : -60,
      opacity: 0,
      filter: 'blur(8px)',
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
    },
    exit: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? -60 : 60,
      opacity: 0,
      filter: 'blur(8px)',
    }),
  }

  return (
    <div className="w-full max-w-[900px]">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between mb-6">
        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <NavigationButton
            direction="prev"
            onClick={() => onNavigate?.('prev')}
            disabled={!hasPrev}
          />
          <NavigationButton
            direction="next"
            onClick={() => onNavigate?.('next')}
            disabled={!hasNext}
          />
        </div>

        {/* View Selector */}
        <ViewSelector
          currentView={viewType}
          currentPeriod={data}
          onViewChange={onViewChange}
          onPeriodSelect={onPeriodSelect}
        />
      </div>

      {/* Main Card */}
      <Card className="bg-white rounded-[24px] border border-[#f1f2f2] px-8 py-8 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Header Row - Period label */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={data.id}
            custom={direction}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="mb-6"
          >
            <p className="text-sm text-[var(--color-neutral-n-600)] font-['Poppins'] mb-1">
              Financial Overview
            </p>
            <h2 className="text-[32px] font-normal text-black font-['Poppins'] leading-tight tracking-[-0.64px]">
              {data.periodLabel}
            </h2>
          </motion.div>
        </AnimatePresence>

        {/* Main Content - Revenue, Metric Cards, Progress Bar */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`metrics-${data.id}`}
            custom={direction}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="mb-6"
          >
            <ThreeColumnMetrics
              revenue={data.revenue}
              costs={data.costs}
              profit={data.revenue - data.costs}
              insight={data.insight}
            />
          </motion.div>
        </AnimatePresence>

        {/* Action Pills - Bottom */}
        <div className="flex gap-3 mb-6">
          <ActionPill
            icon={CreditCard}
            label={`Review ${data.uncategorizedTransactions} Uncategorized Transactions`}
            showBadge
          />
          <ActionPill icon={FileText} label="Generate P&L Report" />
        </div>
      </Card>
    </div>
  )
}

// Sub-components

interface ThreeColumnMetricsProps {
  revenue: number
  costs: number
  profit: number
  insight: string
}

function ThreeColumnMetrics({ revenue, costs, profit, insight }: ThreeColumnMetricsProps) {
  const isNegative = profit < 0

  // For the bar, we show costs portion vs profit portion
  const barCostsPercent = isNegative
    ? 70
    : Math.min(90, Math.max(10, (costs / revenue) * 100))
  const barProfitPercent = 100 - barCostsPercent

  // Get period label based on view type
  const getPeriodLabel = () => {
    return 'Revenue this Quarter'
  }

  return (
    <div className="space-y-6">
      {/* Main Content Row */}
      <div className="flex items-start gap-6">
        {/* Left side - Large Revenue Number */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <AnimatedNumber
              value={revenue}
              className="text-[72px] font-medium text-black font-['Poppins'] leading-none tracking-[-1.44px]"
              format="compact"
            />
            <span className="px-3 py-1 rounded-full border border-[var(--color-neutral-g-200)] text-sm text-[var(--color-neutral-n-700)] font-['Poppins']">
              {getPeriodLabel()}
            </span>
          </div>
          <p className="text-sm text-[var(--color-neutral-n-600)] font-['Poppins'] mb-2">
            {insight}
          </p>
          <button className="flex items-center gap-1 text-sm text-[#467c75] font-medium font-['Poppins'] hover:opacity-80 transition-opacity">
            View Insights
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right side - Metric Cards */}
        <div className="flex gap-4">
          {/* Costs Card */}
          <div className="bg-white border border-[#f1f2f2] rounded-xl px-5 py-4 min-w-[180px]">
            <div className="w-10 h-10 rounded-lg bg-[#fafafa] flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5 text-[#c89d7b]" />
            </div>
            <p className="text-sm text-[var(--color-neutral-n-600)] font-['Poppins'] mb-1">
              Costs
            </p>
            <div className="flex items-end justify-between">
              <AnimatedNumber
                value={costs}
                className="text-[26px] font-semibold text-[#c89d7b] font-['Poppins'] leading-tight tracking-[-0.52px]"
                format="full"
              />
              <button className="flex items-center gap-1 text-[13px] text-[var(--color-neutral-n-700)] font-['Poppins'] hover:opacity-80 transition-opacity whitespace-nowrap">
                Tell Me More
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Cash On Hand Card */}
          <div className="bg-white border border-[#f1f2f2] rounded-xl px-5 py-4 min-w-[180px]">
            <div className="w-10 h-10 rounded-lg bg-[#fafafa] flex items-center justify-center mb-3">
              <Wallet className="w-5 h-5 text-[#467c75]" />
            </div>
            <p className="text-sm text-[var(--color-neutral-n-600)] font-['Poppins'] mb-1">
              Cash On Hand
            </p>
            <div className="flex items-end justify-between">
              <AnimatedNumber
                value={profit > 0 ? profit + 15000 : 15000}
                className="text-[26px] font-semibold text-[#467c75] font-['Poppins'] leading-tight tracking-[-0.52px]"
                format="full"
              />
              <button className="flex items-center gap-1 text-[13px] text-[var(--color-neutral-n-700)] font-['Poppins'] hover:opacity-80 transition-opacity whitespace-nowrap">
                Tell Me More
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar - Full Width */}
      <div className="h-6 rounded-lg overflow-hidden flex">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barCostsPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          className="h-full bg-[#c89d7b] rounded-l-lg"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barProfitPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
          className="h-full bg-[#467c75] rounded-r-lg"
        />
      </div>
    </div>
  )
}

function ViewSelector({
  currentView,
  currentPeriod,
  onViewChange,
  onPeriodSelect,
}: {
  currentView: string
  currentPeriod: FinancialPeriod
  onViewChange?: (view: 'month' | 'quarter' | 'year') => void
  onPeriodSelect?: (periodId: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const views: Array<{ label: string; value: 'month' | 'quarter' | 'year' }> = [
    { label: 'Month', value: 'month' },
    { label: 'Quarter', value: 'quarter' },
    { label: 'Year', value: 'year' },
  ]

  // Get periods for current view type
  const getPeriods = (): FinancialPeriod[] => {
    switch (currentView) {
      case 'month':
        return monthlyFinancialData
      case 'quarter':
        return quarterlyFinancialData
      case 'year':
        return yearlyFinancialData
      default:
        return monthlyFinancialData
    }
  }

  const periods = getPeriods()

  return (
    <div className="flex items-center bg-white border border-[#f1f2f2] rounded-full p-1">
      {views.map(({ label, value }) => {
        const isActive = value === currentView

        if (isActive) {
          // Active view gets a dropdown
          return (
            <DropdownMenu key={value} open={isOpen} onOpenChange={setIsOpen} modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1 px-3 py-0.5 rounded-full text-[15px] font-['Poppins'] cursor-pointer transition-all bg-[#fafafa] text-[#467c75] font-semibold"
                >
                  {label}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#467c75]">
                    <motion.path
                      d="M18 9L12 15L6 9"
                      animate={{ d: isOpen ? "M18 12L12 12L6 12" : "M18 9L12 15L6 9" }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="bottom"
                sideOffset={8}
                className="w-[200px] p-2 bg-white border border-[#f1f2f2] rounded-xl shadow-lg"
              >
                {periods.map((period) => (
                  <DropdownMenuItem
                    key={period.id}
                    className={`
                      px-3 py-2 rounded-lg cursor-pointer transition-colors text-[15px] font-['Poppins']
                      ${period.id === currentPeriod.id
                        ? 'bg-[#fafafa] text-[#467c75] font-medium'
                        : 'text-[var(--color-neutral-n-700)] hover:bg-[#fafafa]'
                      }
                    `}
                    onClick={() => {
                      onPeriodSelect?.(period.id)
                      setIsOpen(false)
                    }}
                  >
                    {period.periodLabel}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }

        // Non-active views are simple buttons
        return (
          <button
            key={value}
            onClick={() => onViewChange?.(value)}
            className="px-3 py-0.5 rounded-full text-[15px] font-['Poppins'] cursor-pointer transition-all text-[var(--color-neutral-n-700)] hover:text-[#467c75]"
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function NavigationButton({
  direction,
  onClick,
  disabled,
}: {
  direction: 'prev' | 'next'
  onClick: () => void
  disabled?: boolean
}) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`
        w-10 h-10 rounded-full border border-[#e5e7e7] bg-white
        flex items-center justify-center transition-colors
        ${disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:bg-[#fafafa] cursor-pointer'
        }
      `}
    >
      <Icon className={`w-5 h-5 ${disabled ? 'text-[#c1c5c5]' : 'text-[var(--color-neutral-n-700)]'}`} strokeWidth={2} />
    </motion.button>
  )
}

function ActionPill({
  icon: Icon,
  label,
  showBadge,
}: {
  icon: typeof CreditCard
  label: string
  showBadge?: boolean
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-neutral-g-200)] bg-white text-[var(--color-neutral-n-700)] hover:bg-[var(--color-neutral-g-50)] transition-colors"
    >
      <div className="relative">
        <Icon className="w-4 h-4" />
        {showBadge && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#dc2626] rounded-full" />
        )}
      </div>
      <span className="text-xs font-['Poppins'] tracking-[-0.24px]">{label}</span>
    </motion.button>
  )
}

