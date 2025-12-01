import { useState, useCallback, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { AnimatedNumber } from '@/components/overview/AnimatedNumber'
import {
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, Cell, ReferenceLine, LabelList } from 'recharts'
import {
  getFinancialDataByView,
  type FinancialPeriod,
  SIMULATED_MONTH,
  SIMULATED_DAY,
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
import { motion, AnimatePresence, LayoutGroup } from 'motion/react'
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
 * Chart Colors - matching the existing design system
 */
const CHART_COLORS = {
  revenue: '#2a4a47',
  costs: '#b68b69',  // Darker tan for costs/loss
  profit: '#467c75', // Brand color for profit
  loss: '#b68b69',   // Same tan for loss bars
} as const

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: CHART_COLORS.revenue,
  },
  costs: {
    label: 'Costs',
    color: CHART_COLORS.costs,
  },
  profit: {
    label: 'Profit',
    color: CHART_COLORS.profit,
  },
}

/**
 * DashboardV2 - New dashboard design matching Figma
 *
 * Features:
 * - Welcome message at top
 * - Navigation arrows and time period toggle (Month/Quarter/Year)
 * - Financial overview card with revenue breakdown
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

export default function DashboardV2() {
  // Default to current period based on today's date
  const [viewType, setViewType] = useState<'month' | 'quarter' | 'year'>('month')
  const [currentIndex, setCurrentIndex] = useState(() => getCurrentPeriodIndex('month'))
  const [direction, setDirection] = useState<'left' | 'right'>('right')

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
      <div className="mb-[27px]">
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
      <Card className="bg-white rounded-[16px] border-[#f1f2f2] overflow-hidden shadow-[-83px_122px_41px_0px_rgba(0,0,0,0),-53px_78px_38px_0px_rgba(0,0,0,0),-30px_44px_32px_0px_rgba(0,0,0,0.01),-13px_20px_24px_0px_rgba(0,0,0,0.02),-3px_5px_13px_0px_rgba(0,0,0,0.02)]">
        {/* Header */}
        <div className="px-6 pt-8 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] text-[var(--color-neutral-n-600)] font-['Poppins'] leading-[20px] tracking-[-0.28px]">
                Financial Overview
              </p>
              <h2 className="text-[32px] font-normal text-black font-['Poppins'] leading-[43.6px] tracking-[-0.64px]">
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
        <AnimatePresence mode="wait">
          {viewType === 'month' ? (
            <motion.div
              key="month-layout"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            >
              <MonthMetricsLayout
                data={currentPeriod}
                previousPeriod={previousPeriod}
                isCurrentPeriod={isCurrentPeriod}
              />
            </motion.div>
          ) : (
            <motion.div
              key="quarter-year-layout"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            >
              <QuarterYearMetricsLayout
                data={currentPeriod}
                previousPeriod={previousPeriod}
                isCurrentPeriod={isCurrentPeriod}
                viewType={viewType}
              />
            </motion.div>
          )}
        </AnimatePresence>
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
 * MonthMetricsLayout - Three cards with horizontal stacked bar below
 * Used for monthly view
 */
function MonthMetricsLayout({ data, previousPeriod, isCurrentPeriod }: MonthMetricsLayoutProps) {
  const profit = data.revenue - data.costs
  const expensesPercent = Math.min(90, Math.max(10, (data.costs / data.revenue) * 100))
  const profitPercent = 100 - expensesPercent

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

  const [hoveredSegment, setHoveredSegment] = useState<'costs' | 'profit' | null>(null)

  // Check if there's no data (for December or empty periods)
  const hasNoData = data.revenue === 0 && data.costs === 0

  return (
    <div className="px-6 pt-6 pb-6">
      {/* Three metric cards */}
      <div className="flex gap-4 mb-8">
        {/* Revenue Card */}
        <MetricCard
          icon={CreditCard}
          iconColor="#467c75"
          label={isCurrentPeriod ? 'Revenue to Date' : 'Revenue'}
          value={data.revenue}
          valueColor="text-black"
          change={revenueChange}
          comparisonLabel={comparisonLabel}
          actionLabel="Tell Me More"
          hideComparison={hasNoData}
        />

        {/* Costs Card */}
        <MetricCard
          icon={Wallet}
          iconColor="#b68b69"
          label={isCurrentPeriod ? 'Costs to Date' : 'Costs'}
          value={data.costs}
          valueColor="text-[#b68b69]"
          change={costsChange}
          invertChangeColor
          comparisonLabel={comparisonLabel}
          actionLabel="Tell Me More"
          hideComparison={hasNoData}
        />

        {/* Profit/Loss Card */}
        <MetricCard
          icon={FileSpreadsheet}
          iconColor={isNetLoss ? '#dc2626' : '#467c75'}
          label={profitLabel}
          value={Math.abs(profit)}
          valueColor={isNetLoss ? 'text-[#dc2626]' : 'text-[#467c75]'}
          change={profitChange}
          comparisonLabel={comparisonLabel}
          actionLabel="Tell Me More"
          hideComparison={hasNoData}
        />
      </div>

      {/* Horizontal stacked bar - 48px height with hover states and 8px border radius */}
      {/* Show solid grey bar when no data, animated bar when data exists */}
      {data.revenue === 0 && data.costs === 0 ? (
        // Empty state - solid light grey bar
        <div className="relative h-12 rounded-lg bg-[#e5e7e7]" />
      ) : (
        <div className="relative h-12 rounded-lg overflow-hidden flex">
          {/* Costs segment - animated */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${expensesPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="h-full bg-[#b68b69] rounded-l-lg cursor-pointer transition-opacity"
            style={{ opacity: hoveredSegment === 'profit' ? 0.6 : 1 }}
            onMouseEnter={() => setHoveredSegment('costs')}
            onMouseLeave={() => setHoveredSegment(null)}
          />
          {/* Profit segment - not animated, fills remaining space */}
          <div
            className={`h-full flex-1 rounded-r-lg cursor-pointer transition-opacity ${isNetLoss ? 'bg-[#dc2626]' : 'bg-[#467c75]'}`}
            style={{ opacity: hoveredSegment === 'costs' ? 0.6 : 1 }}
            onMouseEnter={() => setHoveredSegment('profit')}
            onMouseLeave={() => setHoveredSegment(null)}
          />

          {/* Hover tooltip - shows percentage of revenue */}
          {hoveredSegment && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#161a1a] text-white px-3 py-2 rounded-lg shadow-xl pointer-events-none z-10">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: hoveredSegment === 'costs' ? '#b68b69' : (isNetLoss ? '#dc2626' : '#467c75') }}
                />
                <span className="text-[13px] text-[#c1c5c5] font-['Poppins']">
                  {hoveredSegment === 'costs' ? 'Costs' : (isNetLoss ? 'Net Loss' : 'Profit')}:
                </span>
                <span className="text-[14px] font-medium font-['Poppins']">
                  ${(hoveredSegment === 'costs' ? data.costs : Math.abs(profit)).toLocaleString()}
                </span>
                <span className="text-[13px] text-[#8d9291] font-['Poppins']">
                  ({hoveredSegment === 'costs' ? Math.round(expensesPercent) : Math.round(profitPercent)}% of revenue)
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Metric Card Component for Month view
interface MetricCardProps {
  icon: typeof CreditCard
  iconColor: string
  label: string
  value: number
  valueColor: string
  change: { value: string; isPositive: boolean }
  invertChangeColor?: boolean
  actionLabel: string
  comparisonLabel?: string  // e.g., "from last month" or "vs Oct 1-30"
  hideComparison?: boolean  // Hide comparison when no data available
}

function MetricCard({
  icon: Icon,
  iconColor,
  label,
  value,
  valueColor,
  change,
  invertChangeColor = false,
  actionLabel,
  comparisonLabel = 'from last month',
  hideComparison = false
}: MetricCardProps) {
  // For costs, positive change (increase) is bad, negative (decrease) is good
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

      {/* Change badge - hidden when no data */}
      {!hideComparison && (
        <div className="mt-2 mb-3">
          <span className={`text-[13px] font-semibold font-['Poppins'] ${isGood ? 'text-[#4e8a59]' : 'text-[#dc2626]'}`}>
            {change.value}
          </span>
          <span className="text-[13px] text-[var(--color-neutral-n-600)] font-['Poppins']">
            {' '}{comparisonLabel}
          </span>
        </div>
      )}
      {hideComparison && <div className="mt-2 mb-3 h-[20px]" />}

      {/* Action button - Chat style pill */}
      <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-neutral-g-200)] text-[var(--color-neutral-n-700)] hover:bg-[var(--color-neutral-g-50)] transition-colors">
        <MessageCircle className="w-4 h-4" />
        <span className="text-[13px] font-['Poppins'] tracking-[-0.26px]">{actionLabel}</span>
      </button>
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
        {/* Revenue Card */}
        <MetricCardCompact
          icon={CreditCard}
          iconColor="#467c75"
          label={isCurrentPeriod ? 'Revenue to Date' : 'Revenue'}
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

// Profit Bar Chart for Quarter/Year view
interface ProfitBarChartProps {
  data: Array<{
    date: string
    revenue: number
    costs: number
    cash: number
  }>  // Kept for type compatibility but not used - data is generated internally
  viewType: 'quarter' | 'year'
  quarterNumber?: number
  isCurrentPeriod?: boolean
}

function ProfitBarChart({ viewType, quarterNumber, isCurrentPeriod = false }: ProfitBarChartProps) {
  // Use simulated date (Dec 9, 2025) for determining if a period has passed
  const currentMonth = SIMULATED_MONTH
  const currentDay = SIMULATED_DAY

  // Generate weekly data for quarter or monthly data for year
  const chartData = useMemo(() => {
    const monthNameToIndex: Record<string, number> = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    }

    if (viewType === 'year') {
      // For year view, use monthly data - only show months through current month
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return months
        .filter((_, idx) => idx <= currentMonth) // Only include months up to December
        .map((month, idx) => {
          // Generate realistic profit/loss data
          const baseProfit = 2000 + Math.sin(idx / 2) * 1500
          const variance = (Math.random() - 0.5) * 2000
          // December (current month) has partial data - scale down
          const isCurrentMonth = idx === currentMonth
          const partialFraction = isCurrentMonth ? currentDay / 31 : 1
          const profit = Math.round((baseProfit + variance) * partialFraction)
          // Month has passed if its index is less than current month
          const isPast = idx < currentMonth
          return {
            label: month,
            dateRange: month,
            profit,
            isProfit: profit > 0,
            uniqueKey: month,
            isPast,
          }
        })
    } else {
      // For quarter view, generate weekly data with date ranges
      const quarterMonths = [
        ['Jan', 'Feb', 'Mar'],
        ['Apr', 'May', 'Jun'],
        ['Jul', 'Aug', 'Sep'],
        ['Oct', 'Nov', 'Dec'],
      ]
      const months = quarterNumber ? quarterMonths[quarterNumber - 1] : quarterMonths[2]

      const weeks: Array<{ label: string; dateRange: string; profit: number; isProfit: boolean; isMonthStart?: boolean; monthLabel?: string; uniqueKey: string; isPast: boolean }> = []

      // Generate actual date ranges for weeks
      let dayOfMonth = 1
      let weekIndex = 0
      months.forEach((month, monthIdx) => {
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        const actualMonthIndex = (quarterNumber ? (quarterNumber - 1) * 3 : 6) + monthIdx
        const monthDays = daysInMonth[actualMonthIndex]
        let weekInMonth = 0

        // Skip future months entirely
        if (actualMonthIndex > currentMonth) {
          return
        }

        while (dayOfMonth <= monthDays) {
          const startDay = dayOfMonth
          const endDay = Math.min(dayOfMonth + 6, monthDays)

          // For current month (December), only include weeks that have started
          if (actualMonthIndex === currentMonth && startDay > currentDay) {
            dayOfMonth = endDay + 1
            weekInMonth++
            weekIndex++
            continue
          }

          const baseProfit = 500 + Math.sin((monthIdx * 5 + weekInMonth) / 3) * 400
          const variance = (Math.random() - 0.5) * 600
          const profit = Math.round(baseProfit + variance)

          // Determine if this week has passed
          // A week has passed if: the month is before current month, OR
          // if same month and the end day is before current day
          const isPast = actualMonthIndex < currentMonth ||
            (actualMonthIndex === currentMonth && endDay < currentDay)

          weeks.push({
            label: `${startDay}-${endDay}`,
            dateRange: `${month} ${startDay}-${endDay}`,
            profit,
            isProfit: profit > 0,
            isMonthStart: weekInMonth === 0,
            monthLabel: month,
            uniqueKey: `w${weekIndex}`,
            isPast,
          })

          dayOfMonth = endDay + 1
          weekInMonth++
          weekIndex++
        }
        dayOfMonth = 1 // Reset for next month
      })

      return weeks
    }
  }, [viewType, quarterNumber, currentMonth, currentDay])

  // Calculate domain for chart
  const maxValue = Math.max(...chartData.map(d => Math.abs(d.profit)))
  const roundedMax = Math.ceil(maxValue / 500) * 500

  // Find month separator indices and labels for quarter view
  // Dotted lines appear BETWEEN months (at idx > 0 where isMonthStart is true)
  // First month label is shown above the first bar (no line)
  const monthSeparators = useMemo(() => {
    if (viewType !== 'quarter') return []
    return chartData
      .map((d, idx) => d.isMonthStart ? { idx, label: d.monthLabel || '', showLine: idx > 0 } : null)
      .filter((item): item is { idx: number; label: string; showLine: boolean } => item !== null)
  }, [chartData, viewType])

  // Get profit label for tooltip - uses isPast from individual data point
  const getProfitLabel = (value: number, isPast: boolean) => {
    // If the period has passed, always use "Profit" or "Net Loss"
    // If the period is ongoing (not past), use "Profit to Date" or "Loss to Date"
    if (value < 0) {
      return isPast ? 'Net Loss' : 'Loss to Date'
    }
    return isPast ? 'Profit' : 'Profit to Date'
  }

  // Custom label for top of bars
  const renderCustomLabel = (props: { x?: number; y?: number; width?: number; value?: number }) => {
    const { x = 0, y = 0, width = 0, value = 0 } = props
    if (value <= 0) return null

    const formatted = value >= 1000
      ? `$${(value / 1000).toFixed(1)}K`
      : `$${value}`

    return (
      <text
        x={x + width / 2}
        y={y - 6}
        fill="#467c75"
        textAnchor="middle"
        fontSize={10}
        fontFamily="Poppins"
        fontWeight={500}
      >
        {formatted}
      </text>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <BarChart
        data={chartData}
        margin={{ top: 30, right: 8, bottom: 20, left: 8 }}
        barCategoryGap={viewType === 'year' ? '20%' : '15%'}
      >
        <XAxis
          dataKey={viewType === 'quarter' ? 'uniqueKey' : 'label'}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{
            fill: '#8d9291',
            fontSize: 11,
            fontFamily: 'Poppins',
          }}
          tickFormatter={viewType === 'quarter' ? (value) => {
            const item = chartData.find(d => d.uniqueKey === value)
            return item?.label || value
          } : undefined}
          interval={viewType === 'year' ? 0 : 'preserveStartEnd'}
        />
        <YAxis hide domain={[-roundedMax * 0.3, roundedMax]} />

        {/* Month separator lines with labels for quarter view */}
        {monthSeparators.map(({ idx, label, showLine }) => (
          <ReferenceLine
            key={`sep-${idx}`}
            x={chartData[idx]?.uniqueKey || chartData[idx]?.label}
            stroke={showLine ? "#c1c5c5" : "transparent"}
            strokeWidth={1}
            strokeDasharray="4 4"
            label={{
              value: label,
              position: 'insideTopLeft',
              fill: '#8d9291',
              fontSize: 11,
              fontFamily: 'Poppins',
              dy: -18,
              dx: showLine ? 4 : -8,
            }}
          />
        ))}

        <ChartTooltip
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null
            const dataPoint = payload[0].payload
            const profit = dataPoint.profit
            const isPast = dataPoint.isPast ?? true // Default to past if not set

            return (
              <div className="rounded-lg bg-[#161a1a] px-3 py-2 shadow-xl">
                <p className="mb-1 text-[13px] text-[#c1c5c5] font-['Poppins']">
                  {dataPoint.dateRange}
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: profit > 0 ? CHART_COLORS.profit : CHART_COLORS.loss }}
                  />
                  <span className="text-[13px] text-[#c1c5c5] font-['Poppins']">
                    {getProfitLabel(profit, isPast)}:
                  </span>
                  <span className="text-[14px] font-medium text-white font-['Poppins']">
                    ${Math.abs(profit).toLocaleString()}
                  </span>
                </div>
              </div>
            )
          }}
        />

        <Bar
          dataKey="profit"
          radius={[4, 4, 0, 0]}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.isProfit ? CHART_COLORS.profit : CHART_COLORS.loss}
            />
          ))}
          <LabelList
            dataKey="profit"
            position="top"
            content={renderCustomLabel}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
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

          return (
            <button
              key={value}
              onClick={() => onViewChange?.(value)}
              className="relative z-10 px-3 py-2 rounded-full text-[15px] font-['Poppins'] cursor-pointer transition-colors text-[var(--color-neutral-n-700)] hover:text-[#467c75] tracking-[-0.3px]"
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
        w-[38px] h-[38px] rounded-full border border-[#e5e7e7] bg-white
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
