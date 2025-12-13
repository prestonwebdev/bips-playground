import { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { AnimatedNumber } from '@/components/overview/AnimatedNumber'
import { ProfitBarChart } from '@/components/charts/ProfitBarChart'
import {
  getFinancialDataByView,
  type FinancialPeriod,
  SIMULATED_MONTH,
  SIMULATED_YEAR,
} from '@/lib/quarterly-data'
import {
  CreditCard,
  FileSpreadsheet,
  Wallet,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { motion, LayoutGroup } from 'motion/react'
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

/**
 * DashboardV1 - Original dashboard design
 *
 * Features:
 * - Welcome message at top
 * - Navigation arrows and time period toggle (Month/Quarter/Year)
 * - Financial overview card with income breakdown
 * - Bar chart showing expenses vs profit with dotted connector lines
 * - Line chart for performance visualization
 */
// Helper to get current period index based on simulated date (December 9, 2025)
function getCurrentPeriodIndex(viewType: 'month' | 'quarter' | 'year'): number {
  switch (viewType) {
    case 'month':
      // Return simulated month index (11 = December)
      return SIMULATED_MONTH
    case 'quarter':
      // Return simulated quarter index (3 = Q4)
      return Math.floor(SIMULATED_MONTH / 3)
    case 'year':
      // For years, find the index of simulated year in the data
      // Assuming years are 2023, 2024, 2025 (indices 0, 1, 2)
      return SIMULATED_YEAR - 2023
  }
}

export default function DashboardV1() {
  // Default to current period based on today's date
  const [viewType, setViewType] = useState<'month' | 'quarter' | 'year'>('month')
  const [currentIndex, setCurrentIndex] = useState(() => getCurrentPeriodIndex('month'))
  const [, setDirection] = useState<'left' | 'right'>('right')

  // Get data for current view type
  const data = getFinancialDataByView(viewType)
  const currentPeriod: FinancialPeriod = data[currentIndex] || data[0]
  const previousPeriod: FinancialPeriod | null = currentIndex > 0 ? data[currentIndex - 1] : null

  // Check if this is the current/latest period based on simulated date (Dec 9, 2025)
  const isCurrentPeriod = (() => {
    const currentQuarter = Math.floor(SIMULATED_MONTH / 3)

    switch (viewType) {
      case 'month':
        return currentPeriod.month === SIMULATED_MONTH && currentPeriod.year === SIMULATED_YEAR
      case 'quarter':
        return currentPeriod.quarter === currentQuarter + 1 && currentPeriod.year === SIMULATED_YEAR
      case 'year':
        return currentPeriod.year === SIMULATED_YEAR
    }
  })()

  // Handle view type change - defaults to current period
  const handleViewChange = useCallback((newView: 'month' | 'quarter' | 'year') => {
    setViewType(newView)
    setCurrentIndex(getCurrentPeriodIndex(newView))
    setDirection('right')
  }, [])

  // Handle navigation
  const handleNavigate = useCallback((dir: 'prev' | 'next') => {
    const newDirection = dir === 'next' ? 'right' : 'left'
    setDirection(newDirection)

    setCurrentIndex((prev) => {
      if (dir === 'next') {
        return Math.min(prev + 1, data.length - 1)
      } else {
        return Math.max(prev - 1, 0)
      }
    })
  }, [data.length])

  // Handle direct period selection from dropdown
  const handlePeriodSelect = useCallback((periodId: string) => {
    const newIndex = data.findIndex(p => p.id === periodId)
    if (newIndex !== -1 && newIndex !== currentIndex) {
      setDirection(newIndex > currentIndex ? 'right' : 'left')
      setCurrentIndex(newIndex)
    }
  }, [data, currentIndex])

  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < data.length - 1

  // Get user's name - in a real app this would come from auth context
  const userName = 'Preston'

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="w-full max-w-[1800px] mx-auto">
      {/* Welcome Message */}
      <div className="mb-7">
        <h1 className="text-[36px] font-normal text-black font-['Poppins'] leading-[44px] tracking-[-0.72px] mb-1">
          {getGreeting()}, {userName}.
        </h1>
        <p className="text-[14px] text-[var(--color-neutral-n-600)] font-['Poppins'] leading-[20px] tracking-[-0.28px]">
          Here are some insights into how things are going.
        </p>
      </div>

      {/* Navigation Row */}
      <div className="flex items-center justify-between mb-5">
        {/* Navigation Arrows */}
        <div className="flex items-center gap-3">
          <NavigationButton
            direction="prev"
            onClick={() => handleNavigate('prev')}
            disabled={!hasPrev}
          />
          <NavigationButton
            direction="next"
            onClick={() => handleNavigate('next')}
            disabled={!hasNext}
          />
        </div>

        {/* View Selector */}
        <ViewSelector
          currentView={viewType}
          currentPeriod={currentPeriod}
          onViewChange={handleViewChange}
          onPeriodSelect={handlePeriodSelect}
        />
      </div>

      {/* Main Card */}
      <Card className="bg-white rounded-[16px] border-[var(--color-neutral-g-100)] overflow-hidden shadow-[-83px_122px_41px_0px_rgba(0,0,0,0),-53px_78px_38px_0px_rgba(0,0,0,0),-30px_44px_32px_0px_rgba(0,0,0,0.01),-13px_20px_24px_0px_rgba(0,0,0,0.02),-3px_5px_13px_0px_rgba(0,0,0,0.02)]">
        {/* Header */}
        <div className="px-6 pt-8 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] text-[var(--color-neutral-n-600)] font-['Poppins'] leading-[20px] tracking-[-0.28px]">
                Financial Overview
              </p>
              <h2 className="text-[32px] font-normal text-black font-['Poppins'] leading-[44px] tracking-[-0.64px]">
                {currentPeriod.periodLabel}
              </h2>
            </div>

            {/* Action Pills */}
            <div className="flex gap-3">
              <ActionPill
                icon={CreditCard}
                label={`Review ${currentPeriod.uncategorizedTransactions} Uncategorized Transactions`}
                showBadge
              />
              <ActionPill icon={FileSpreadsheet} label="Generate P&L Report" />
            </div>
          </div>
        </div>

        {/* Metrics Section - Different layouts for month vs quarter/year */}
        {viewType === 'month' ? (
          <MonthMetricsLayout
            data={currentPeriod}
            previousPeriod={previousPeriod}
            isCurrentPeriod={isCurrentPeriod}
          />
        ) : (
          <QuarterYearMetricsLayout
            data={currentPeriod}
            previousPeriod={previousPeriod}
            isCurrentPeriod={isCurrentPeriod}
            viewType={viewType}
          />
        )}
      </Card>
    </div>
  )
}

// Helper to calculate percentage change
function calcPercentChange(current: number, previous: number | undefined): { value: string; isPositive: boolean } {
  if (!previous || previous === 0) return { value: '—', isPositive: true }
  const change = ((current - previous) / previous) * 100
  const isPositive = change >= 0
  return {
    value: `${isPositive ? '+' : ''}${Math.round(change)}%`,
    isPositive,
  }
}

// Helper to calculate period-to-date comparison (for current periods)
function calcPeriodToDateChange(
  current: number,
  previousPeriodToDate: number | undefined
): { value: string; isPositive: boolean } {
  if (!previousPeriodToDate || previousPeriodToDate === 0) return { value: '—', isPositive: true }
  const change = ((current - previousPeriodToDate) / previousPeriodToDate) * 100
  const isPositive = change >= 0
  return {
    value: `${isPositive ? '+' : ''}${Math.round(change)}%`,
    isPositive,
  }
}

// Month view layout interface
interface MonthMetricsLayoutProps {
  data: FinancialPeriod
  previousPeriod: FinancialPeriod | null
  isCurrentPeriod: boolean
}

/**
 * MonthMetricsLayout - Three cards with daily bar chart below
 * Used for monthly view (same style as quarter/year views)
 */
function MonthMetricsLayout({ data, previousPeriod, isCurrentPeriod }: MonthMetricsLayoutProps) {
  const profit = data.revenue - data.costs

  // For current period: use period-to-date comparison (e.g., Nov 1-30 vs Oct 1-30)
  // For past periods: use full period comparison
  const ptdComparison = data.periodToDateComparison

  let revenueChange: { value: string; isPositive: boolean }
  let costsChange: { value: string; isPositive: boolean }
  let profitChange: { value: string; isPositive: boolean }
  let comparisonLabel: string

  if (isCurrentPeriod && ptdComparison) {
    // Period-to-date comparison for current period
    const previousPtdProfit = ptdComparison.previousPeriodToDateRevenue - ptdComparison.previousPeriodToDateCosts
    revenueChange = calcPeriodToDateChange(data.revenue, ptdComparison.previousPeriodToDateRevenue)
    costsChange = calcPeriodToDateChange(data.costs, ptdComparison.previousPeriodToDateCosts)
    profitChange = calcPeriodToDateChange(profit, previousPtdProfit)
    comparisonLabel = `vs ${ptdComparison.comparisonLabel}`
  } else {
    // Full period comparison for past periods
    const previousProfit = previousPeriod ? previousPeriod.revenue - previousPeriod.costs : undefined
    revenueChange = calcPercentChange(data.revenue, previousPeriod?.revenue)
    costsChange = calcPercentChange(data.costs, previousPeriod?.costs)
    profitChange = calcPercentChange(profit, previousProfit)
    comparisonLabel = 'from last month'
  }

  const isNetLoss = profit < 0
  const profitLabel = isNetLoss
    ? (isCurrentPeriod ? 'Loss to Date' : 'Net Loss')
    : (isCurrentPeriod ? 'Profit to Date' : 'Profit')

  return (
    <div className="px-6 pt-6 pb-6">
      {/* Three metric cards */}
      <div className="flex gap-4 mb-8">
        {/* Income Card */}
        <MetricCardCompact
          icon={CreditCard}
          iconColor="#467c75"
          label={isCurrentPeriod ? 'Income to Date' : 'Income'}
          value={data.revenue}
          valueColor="text-black"
          change={revenueChange}
          periodLabel={comparisonLabel}
          actionLabel="Tell Me More"
        />

        {/* Costs Card */}
        <MetricCardCompact
          icon={Wallet}
          iconColor="#b68b69"
          label={isCurrentPeriod ? 'Costs to Date' : 'Costs'}
          value={data.costs}
          valueColor="text-[#b68b69]"
          change={costsChange}
          invertChangeColor
          periodLabel={comparisonLabel}
          actionLabel="Tell Me More"
        />

        {/* Profit/Loss Card */}
        <MetricCardCompact
          icon={FileSpreadsheet}
          iconColor={isNetLoss ? '#dc2626' : '#467c75'}
          label={profitLabel}
          value={Math.abs(profit)}
          valueColor={isNetLoss ? 'text-[#dc2626]' : 'text-[#467c75]'}
          change={profitChange}
          periodLabel={comparisonLabel}
          actionLabel="Tell Me More"
        />
      </div>

      {/* Daily bar chart showing profit/loss per day */}
      <ProfitBarChart
        data={data.dailyBreakdown || []}
        viewType="month"
        monthNumber={data.month}
        isCurrentPeriod={isCurrentPeriod}
      />
    </div>
  )
}

// Quarter/Year view layout interface
interface QuarterYearMetricsLayoutProps {
  data: FinancialPeriod
  previousPeriod: FinancialPeriod | null
  isCurrentPeriod: boolean
  viewType: 'quarter' | 'year'
}

/**
 * QuarterYearMetricsLayout - Three cards with vertical bar chart below
 * Used for quarterly and yearly views
 */
function QuarterYearMetricsLayout({ data, previousPeriod, isCurrentPeriod, viewType }: QuarterYearMetricsLayoutProps) {
  const profit = data.revenue - data.costs

  // For current period: use period-to-date comparison
  // For past periods: use full period comparison
  const ptdComparison = data.periodToDateComparison

  let revenueChange: { value: string; isPositive: boolean }
  let costsChange: { value: string; isPositive: boolean }
  let profitChange: { value: string; isPositive: boolean }
  let comparisonLabel: string

  if (isCurrentPeriod && ptdComparison) {
    // Period-to-date comparison for current period
    const previousPtdProfit = ptdComparison.previousPeriodToDateRevenue - ptdComparison.previousPeriodToDateCosts
    revenueChange = calcPeriodToDateChange(data.revenue, ptdComparison.previousPeriodToDateRevenue)
    costsChange = calcPeriodToDateChange(data.costs, ptdComparison.previousPeriodToDateCosts)
    profitChange = calcPeriodToDateChange(profit, previousPtdProfit)
    comparisonLabel = `vs ${ptdComparison.comparisonLabel}`
  } else {
    // Full period comparison for past periods
    const previousProfit = previousPeriod ? previousPeriod.revenue - previousPeriod.costs : undefined
    revenueChange = calcPercentChange(data.revenue, previousPeriod?.revenue)
    costsChange = calcPercentChange(data.costs, previousPeriod?.costs)
    profitChange = calcPercentChange(profit, previousProfit)
    comparisonLabel = viewType === 'quarter' ? 'from last quarter' : 'from last year'
  }

  const isNetLoss = profit < 0
  const profitLabel = isNetLoss
    ? (isCurrentPeriod ? 'Loss to Date' : 'Net Loss')
    : (isCurrentPeriod ? 'Profit to Date' : 'Profit')

  return (
    <div className="px-6 pt-6 pb-6">
      {/* Three metric cards */}
      <div className="flex gap-4 mb-8">
        {/* Income Card */}
        <MetricCardCompact
          icon={CreditCard}
          iconColor="#467c75"
          label={isCurrentPeriod ? 'Income to Date' : 'Income'}
          value={data.revenue}
          valueColor="text-black"
          change={revenueChange}
          periodLabel={comparisonLabel}
          actionLabel="Tell Me More"
        />

        {/* Costs Card */}
        <MetricCardCompact
          icon={Wallet}
          iconColor="#b68b69"
          label={isCurrentPeriod ? 'Costs to Date' : 'Costs'}
          value={data.costs}
          valueColor="text-[#b68b69]"
          change={costsChange}
          invertChangeColor
          periodLabel={comparisonLabel}
          actionLabel="Tell Me More"
        />

        {/* Profit/Loss Card */}
        <MetricCardCompact
          icon={FileSpreadsheet}
          iconColor={isNetLoss ? '#dc2626' : '#467c75'}
          label={profitLabel}
          value={Math.abs(profit)}
          valueColor={isNetLoss ? 'text-[#dc2626]' : 'text-[#467c75]'}
          change={profitChange}
          periodLabel={comparisonLabel}
          actionLabel="Tell Me More"
        />
      </div>

      {/* Vertical bar chart showing profit/loss per period */}
      <ProfitBarChart
        data={data.dailyBreakdown || []}
        viewType={viewType}
        quarterNumber={data.quarter}
        isCurrentPeriod={isCurrentPeriod}
      />
    </div>
  )
}

// Compact Metric Card for Quarter/Year view
interface MetricCardCompactProps {
  icon: typeof CreditCard
  iconColor: string
  label: string
  value: number
  valueColor: string
  change: { value: string; isPositive: boolean }
  invertChangeColor?: boolean
  periodLabel: string
  actionLabel: string
}

function MetricCardCompact({
  icon: Icon,
  iconColor,
  label,
  value,
  valueColor,
  change,
  invertChangeColor = false,
  periodLabel,
  actionLabel
}: MetricCardCompactProps) {
  const isGood = invertChangeColor ? !change.isPositive : change.isPositive

  return (
    <div className="flex-1 bg-white border border-[var(--color-neutral-g-100)] rounded-[16px] p-5">
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>

      {/* Label */}
      <p className="text-[14px] text-[var(--color-neutral-n-600)] font-['Poppins'] mb-1">
        {label}
      </p>

      {/* Value */}
      <AnimatedNumber
        value={value}
        className={`text-[32px] font-semibold font-['Poppins'] leading-tight tracking-[-0.64px] ${valueColor}`}
        format="full"
      />

      {/* Change badge */}
      <div className="mt-2 mb-3">
        <span className={`text-[13px] font-semibold font-['Poppins'] ${isGood ? 'text-[#4e8a59]' : 'text-[#dc2626]'}`}>
          {change.value}
        </span>
        <span className="text-[13px] text-[var(--color-neutral-n-600)] font-['Poppins']">
          {' '}{periodLabel}
        </span>
      </div>

      {/* Action button - Chat style pill */}
      <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-neutral-g-200)] text-[var(--color-neutral-n-700)] hover:bg-[var(--color-neutral-g-50)] transition-colors">
        <MessageCircle className="w-4 h-4" />
        <span className="text-[13px] font-['Poppins'] tracking-[-0.26px]">{actionLabel}</span>
      </button>
    </div>
  )
}

// View Selector Component with animated sliding indicator
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
    <LayoutGroup>
      <div className="relative flex items-center bg-white border border-[var(--color-neutral-g-100)] rounded-full p-1">
        {views.map(({ label, value }) => {
          const isActive = value === currentView

          if (isActive) {
            return (
              <DropdownMenu key={value} open={isOpen} onOpenChange={setIsOpen} modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative z-10 flex items-center gap-1 px-3 py-2 rounded-full text-[15px] font-['Poppins'] cursor-pointer text-[var(--color-primary-p-500)] font-semibold tracking-[-0.3px]"
                  >
                    {/* Animated background indicator */}
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-[var(--color-neutral-g-100)] rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                    <span className="relative z-10">{label}</span>
                    <ChevronDown className={`relative z-10 w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="bottom"
                  sideOffset={8}
                  className="w-[200px] p-2 bg-white border border-[var(--color-neutral-g-100)] rounded-xl shadow-lg"
                >
                  {periods.map((period) => (
                    <DropdownMenuItem
                      key={period.id}
                      className={`
                        px-3 py-2 rounded-lg cursor-pointer transition-colors text-[15px] font-['Poppins']
                        ${period.id === currentPeriod.id
                          ? 'bg-[var(--color-neutral-g-50)] text-[var(--color-primary-p-500)] font-medium'
                          : 'text-[var(--color-neutral-n-700)] hover:bg-[var(--color-neutral-g-50)]'
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

          return (
            <button
              key={value}
              onClick={() => onViewChange?.(value)}
              className="relative z-10 px-3 py-2 rounded-full text-[15px] font-['Poppins'] cursor-pointer transition-colors text-[var(--color-neutral-n-700)] hover:text-[var(--color-primary-p-500)] tracking-[-0.3px]"
            >
              {label}
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}

// Navigation Button Component
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
        w-[40px] h-[40px] rounded-full border border-[var(--color-neutral-g-200)] bg-white
        flex items-center justify-center transition-colors
        ${disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:bg-[var(--color-neutral-g-50)] cursor-pointer'
        }
      `}
    >
      <Icon className={`w-5 h-5 ${disabled ? 'text-[var(--color-neutral-g-400)]' : 'text-[var(--color-neutral-n-700)]'}`} strokeWidth={2} />
    </motion.button>
  )
}

// Action Pill Component
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
      className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-neutral-g-200)] bg-white text-[var(--color-neutral-n-700)] hover:bg-[var(--color-neutral-g-50)] transition-colors"
    >
      <div className="relative">
        <Icon className="w-5 h-5" />
        {showBadge && (
          <div className="absolute -top-0.5 -right-0.5 w-[9px] h-[9px] bg-[#c89d7b] rounded-full" />
        )}
      </div>
      <span className="text-[13px] font-['Poppins'] tracking-[-0.26px]">{label}</span>
    </motion.button>
  )
}
