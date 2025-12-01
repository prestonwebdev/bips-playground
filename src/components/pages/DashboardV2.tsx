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

// Profit Bar Chart for Month/Quarter/Year view
interface ProfitBarChartProps {
  data: Array<{
    date: string
    revenue: number
    costs: number
    cash: number
  }>  // Kept for type compatibility but not used - data is generated internally
  viewType: 'month' | 'quarter' | 'year'
  quarterNumber?: number
  monthNumber?: number  // 0-11 for month index
  isCurrentPeriod?: boolean
}

function ProfitBarChart({ viewType, quarterNumber, monthNumber, isCurrentPeriod = false }: ProfitBarChartProps) {
  // Use simulated date (Dec 9, 2025) for determining if a period has passed
  const currentMonth = SIMULATED_MONTH
  const currentDay = SIMULATED_DAY

  // Generate daily/weekly/monthly data based on view type
  const chartData = useMemo(() => {
    const monthNameToIndex: Record<string, number> = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    }
    const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    if (viewType === 'month') {
      // For month view, generate daily profit data with revenue and costs
      // Always show full month, with future days as lighter grey placeholders
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      const targetMonth = monthNumber ?? currentMonth
      const monthDays = daysInMonth[targetMonth]
      const monthName = shortMonthNames[targetMonth]

      // For current month, determine which day is "today"
      const isThisCurrentMonth = targetMonth === currentMonth
      const todayDay = isThisCurrentMonth ? currentDay : null

      const days: Array<{ label: string; dateRange: string; profit: number; revenue: number; costs: number; isProfit: boolean; uniqueKey: string; isPast: boolean; isFuture: boolean; isToday: boolean; hasNoTransactions: boolean }> = []

      // Use seeded random for consistent data
      const seed = targetMonth * 1000
      const seededRandom = (day: number) => {
        const x = Math.sin(seed + day) * 10000
        return x - Math.floor(x)
      }

      // Generate data for ALL days in the month
      for (let day = 1; day <= monthDays; day++) {
        // Determine if this day is in the past, today, or future
        const isPast = targetMonth < currentMonth ||
          (isThisCurrentMonth && day < currentDay)
        const isFuture = isThisCurrentMonth && day > currentDay
        const isToday = isThisCurrentMonth && day === currentDay

        // Future days have no data yet
        if (isFuture) {
          days.push({
            label: `${day}`,
            dateRange: `${monthName} ${day}`,
            profit: 20, // Small placeholder for bar height
            revenue: 0,
            costs: 0,
            isProfit: true,
            uniqueKey: `d${day}`,
            isPast: false,
            isFuture: true,
            isToday: false,
            hasNoTransactions: true, // Treat as no transactions for styling
          })
          continue
        }

        // Generate realistic daily data with some negative days, zero days, and positive days
        const rand = seededRandom(day)

        // ~15% chance of no transactions (weekends, holidays)
        // ~20% chance of negative day
        // ~65% chance of positive day
        let profit: number
        let revenue: number
        let costs: number
        let hasNoTransactions = false

        let isLoss = false
        if (rand < 0.15) {
          // No transactions day (weekends, slow days)
          // Use a small positive value so the bar renders, but mark as no transactions
          profit = 20 // Small placeholder value for bar height
          revenue = 0
          costs = 0
          hasNoTransactions = true
        } else if (rand < 0.35) {
          // Negative day - costs exceeded revenue (negative value extends downward)
          revenue = 200 + Math.round(seededRandom(day * 2) * 400)
          costs = revenue + 100 + Math.round(seededRandom(day * 3) * 400)
          profit = revenue - costs // Negative value - bar extends downward
          isLoss = true
        } else {
          // Positive day
          revenue = 500 + Math.round(seededRandom(day * 2) * 800)
          costs = 100 + Math.round(seededRandom(day * 3) * 300)
          profit = revenue - costs
        }

        days.push({
          label: `${day}`,
          dateRange: `${monthName} ${day}`,
          profit,
          revenue,
          costs,
          isProfit: !isLoss && !hasNoTransactions,
          uniqueKey: `d${day}`,
          isPast,
          isFuture: false,
          isToday,
          hasNoTransactions,
        })
      }

      return days
    } else if (viewType === 'year') {
      // For year view, use monthly data - only show months through current month
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

      // Use seeded random for consistent data
      const seededRandom = (seed: number) => {
        const x = Math.sin(seed * 9999) * 10000
        return x - Math.floor(x)
      }

      return months
        .filter((_, idx) => idx <= currentMonth) // Only include months up to December
        .map((month, idx) => {
          // December (current month) has partial data - scale down
          const isCurrentMonth = idx === currentMonth
          const partialFraction = isCurrentMonth ? currentDay / 31 : 1

          // Use seeded random for consistent values
          const rand = seededRandom(idx + 100)

          let revenue: number
          let costs: number
          let profit: number

          // Make some months have losses (Aug, Sep, Oct in this case based on seed)
          if (rand < 0.25) {
            // Loss month
            revenue = Math.round((8000 + seededRandom(idx * 2) * 4000) * partialFraction)
            costs = Math.round((revenue + 50 + seededRandom(idx * 3) * 200) * partialFraction)
            profit = revenue - costs
          } else {
            // Profit month
            const baseRevenue = 20000 + Math.sin(idx / 2) * 5000
            const baseCosts = 15000 + Math.sin(idx / 3) * 3000
            const variance = seededRandom(idx * 4) * 4000 - 2000
            revenue = Math.round((baseRevenue + variance) * partialFraction)
            costs = Math.round((baseCosts + variance * 0.5) * partialFraction)
            profit = revenue - costs
          }

          // Month has passed if its index is less than current month
          const isPast = idx < currentMonth
          return {
            label: month,
            dateRange: month,
            profit,
            revenue,
            costs,
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

      const weeks: Array<{ label: string; dateRange: string; profit: number; revenue: number; costs: number; isProfit: boolean; isMonthStart?: boolean; monthLabel?: string; uniqueKey: string; isPast: boolean }> = []

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

          // Generate realistic weekly revenue, costs, and profit
          const baseRevenue = 5000 + Math.sin((monthIdx * 5 + weekInMonth) / 3) * 2000
          const baseCosts = 3500 + Math.sin((monthIdx * 3 + weekInMonth) / 2) * 1000
          const variance = (Math.random() - 0.5) * 1500
          const revenue = Math.round(baseRevenue + variance)
          const costs = Math.round(baseCosts + variance * 0.5)
          const profit = revenue - costs

          // Determine if this week has passed
          // A week has passed if: the month is before current month, OR
          // if same month and the end day is before current day
          const isPast = actualMonthIndex < currentMonth ||
            (actualMonthIndex === currentMonth && endDay < currentDay)

          weeks.push({
            label: `${startDay}-${endDay}`,
            dateRange: `${month} ${startDay}-${endDay}`,
            profit,
            revenue,
            costs,
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
  }, [viewType, quarterNumber, monthNumber, currentMonth, currentDay])

  // Check if there are any negative values in the data
  const hasNegativeValues = chartData.some(d => d.profit < 0)

  // Calculate domain for chart - only extend to negative when there are negative values
  const maxValue = Math.max(...chartData.map(d => Math.abs(d.profit)))
  const minValue = hasNegativeValues ? Math.min(...chartData.map(d => d.profit)) : 0
  const roundedMax = Math.ceil(maxValue / 500) * 500
  const roundedMin = hasNegativeValues ? Math.floor(minValue / 500) * 500 : 0

  // Calculate gap value (about 2-3px worth of the chart range)
  const totalRange = roundedMax - roundedMin
  const gapValue = totalRange * 0.015 // 1.5% of range for visible gap

  // Transform chart data - add gap by shifting values away from zero
  const chartDataWithGap = chartData.map(d => ({
    ...d,
    // Shift positive values up by gap, negative values down by gap
    displayProfit: d.profit > 0 ? d.profit + gapValue : d.profit < 0 ? d.profit - gapValue : d.profit,
  }))

  // Find month separator indices and labels for quarter view
  // Dotted lines appear BETWEEN months - positioned to the left of the first bar of each month
  // All months get dotted lines (including the first one)
  const monthSeparators = useMemo(() => {
    if (viewType !== 'quarter') return []
    return chartData
      .map((d, idx) => d.isMonthStart ? { idx, label: d.monthLabel || '' } : null)
      .filter((item): item is { idx: number; label: string } => item !== null)
  }, [chartData, viewType])

  // Find "Today" indicator for month view - positioned at today's bar
  const todayIndicator = useMemo(() => {
    if (viewType !== 'month') return null
    const todayIndex = chartData.findIndex((d) => 'isToday' in d && d.isToday)
    if (todayIndex === -1) return null
    return {
      idx: todayIndex,
      label: chartData[todayIndex]?.label || '',
      uniqueKey: chartData[todayIndex]?.uniqueKey || `d${todayIndex + 1}`,
    }
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

  // Custom label for bars - show dollar values above bars (and above zero line for losses)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomLabel = (props: any) => {
    const { x = 0, y = 0, width = 0, height = 0, index = 0 } = props

    // Get the data point to check if it's a future day or no-transaction day
    const dataPoint = chartDataWithGap[index]
    const hasNoTransactions = dataPoint && 'hasNoTransactions' in dataPoint && dataPoint.hasNoTransactions
    const isFuture = dataPoint && 'isFuture' in dataPoint && dataPoint.isFuture

    // Use original profit value for display (not the gap-adjusted displayProfit)
    const originalProfit = dataPoint?.profit ?? 0

    // Skip labels for no-transaction days and future days
    if (originalProfit === 0 || hasNoTransactions || isFuture) return null

    // Format with negative sign for losses
    const absValue = Math.abs(originalProfit)
    const sign = originalProfit < 0 ? '-' : ''
    const formatted = absValue >= 1000
      ? `$${sign}${(absValue / 1000).toFixed(1)}K`
      : `$${sign}${absValue}`

    // Use appropriate color: green for profit, tan for loss
    const isProfit = originalProfit > 0
    const fill = isProfit ? '#467c75' : CHART_COLORS.loss

    // For profit: y is at top of bar, position label above it
    // For loss: y is at the BOTTOM of the bar (most negative point),
    //           need to go back up to zero line which is y + |height|
    let labelY: number
    if (isProfit) {
      labelY = y - 6
    } else {
      // For negative bars: y is at bottom, height is the bar length going up to zero
      // So zero line is at y + height, position label above that
      labelY = y + height - 6
    }

    return (
      <text
        x={x + width / 2}
        y={labelY}
        fill={fill}
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
        data={chartDataWithGap}
        margin={{ top: 30, right: 8, bottom: 8, left: 8 }}
        barCategoryGap={viewType === 'year' ? '20%' : '15%'}
      >
        <XAxis
          dataKey={viewType === 'quarter' ? 'uniqueKey' : 'label'}
          tickLine={false}
          axisLine={false}
          tick={viewType !== 'month'}
          fontSize={11}
          fontFamily="Poppins"
          stroke="#8d9291"
        />
        <YAxis hide domain={[roundedMin - gapValue, roundedMax + gapValue]} />

        {/* Zero reference line - always show for visual baseline */}
        <ReferenceLine y={0} stroke="#e5e7e7" strokeWidth={1} strokeDasharray="4 4" />

        {/* Month separator lines with labels for quarter view */}
        {/* Lines are drawn at the position of the first bar of each month, offset to the left */}
        {monthSeparators.map(({ idx, label }, sepIndex) => (
          <ReferenceLine
            key={`sep-${idx}`}
            x={chartData[idx]?.uniqueKey || chartData[idx]?.label}
            stroke="#c1c5c5"
            strokeWidth={1}
            strokeDasharray="4 4"
            // Position line on left edge of bar category
            position="start"
            label={{
              value: label,
              position: 'insideTopLeft',
              fill: '#8d9291',
              fontSize: 11,
              fontFamily: 'Poppins',
              dy: -18,
              dx: sepIndex === 0 ? -8 : 4,
            }}
          />
        ))}

        {/* "Today" indicator line for month view */}
        {todayIndicator && (
          <ReferenceLine
            x={todayIndicator.label}
            stroke="#c1c5c5"
            strokeWidth={1}
            strokeDasharray="4 4"
            position="start"
            label={{
              value: 'Today',
              position: 'insideTopLeft',
              fill: '#8d9291',
              fontSize: 11,
              fontFamily: 'Poppins',
              dy: -18,
              dx: 4,
            }}
          />
        )}

        <ChartTooltip
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null
            const dataPoint = payload[0].payload
            const profit = dataPoint.profit
            const isPast = dataPoint.isPast ?? true // Default to past if not set
            const hasNoTransactions = dataPoint.hasNoTransactions ?? false
            const isFuture = dataPoint.isFuture ?? false

            // Handle future days and zero-transaction days
            if (hasNoTransactions || isFuture) {
              return (
                <div className="rounded-lg bg-[#161a1a] px-3 py-2 shadow-xl">
                  <p className="mb-1 text-[13px] text-[#c1c5c5] font-['Poppins']">
                    {dataPoint.dateRange}
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: '#e5e7e7' }}
                    />
                    <span className="text-[13px] text-[#8d9291] font-['Poppins']">
                      No transactions
                    </span>
                  </div>
                </div>
              )
            }

            const revenue = dataPoint.revenue ?? 0
            const costs = dataPoint.costs ?? 0

            return (
              <div className="rounded-lg bg-[#161a1a] px-3 py-2 shadow-xl min-w-[180px]">
                <p className="mb-2 text-[13px] text-[#c1c5c5] font-['Poppins']">
                  {dataPoint.dateRange}
                </p>
                {/* Revenue */}
                <div className="flex items-center justify-between gap-4 mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: CHART_COLORS.revenue }}
                    />
                    <span className="text-[13px] text-[#c1c5c5] font-['Poppins']">
                      Revenue
                    </span>
                  </div>
                  <span className="text-[13px] font-medium text-white font-['Poppins']">
                    ${revenue.toLocaleString()}
                  </span>
                </div>
                {/* Costs */}
                <div className="flex items-center justify-between gap-4 mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: CHART_COLORS.costs }}
                    />
                    <span className="text-[13px] text-[#c1c5c5] font-['Poppins']">
                      Costs
                    </span>
                  </div>
                  <span className="text-[13px] font-medium text-white font-['Poppins']">
                    ${costs.toLocaleString()}
                  </span>
                </div>
                {/* Profit/Loss */}
                <div className="flex items-center justify-between gap-4 pt-1 border-t border-[#333]">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: profit > 0 ? CHART_COLORS.profit : CHART_COLORS.loss }}
                    />
                    <span className="text-[13px] text-[#c1c5c5] font-['Poppins']">
                      {getProfitLabel(profit, isPast)}
                    </span>
                  </div>
                  <span className="text-[13px] font-medium text-white font-['Poppins']">
                    ${Math.abs(profit).toLocaleString()}
                  </span>
                </div>
              </div>
            )
          }}
        />

        <Bar
          dataKey="displayProfit"
          radius={[4, 4, 4, 4]}
        >
          {chartDataWithGap.map((entry, index) => {
            // For zero-transaction days, show light grey
            const hasNoTransactions = 'hasNoTransactions' in entry && entry.hasNoTransactions
            let fill: string
            if (hasNoTransactions) {
              fill = '#e5e7e7' // Light grey for no transactions
            } else if (entry.profit > 0) {
              fill = CHART_COLORS.profit
            } else {
              fill = CHART_COLORS.loss
            }
            return (
              <Cell
                key={`cell-${index}`}
                fill={fill}
              />
            )
          })}
          <LabelList
            dataKey="displayProfit"
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
