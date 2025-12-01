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
import { motion } from 'motion/react'
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
export default function DashboardV2() {
  const [viewType, setViewType] = useState<'month' | 'quarter' | 'year'>('quarter')
  const [currentIndex, setCurrentIndex] = useState(2) // Start at Q3 (index 2)
  const [direction, setDirection] = useState<'left' | 'right'>('right')

  // Get data for current view type
  const data = getFinancialDataByView(viewType)
  const currentPeriod: FinancialPeriod = data[currentIndex] || data[0]
  const previousPeriod: FinancialPeriod | null = currentIndex > 0 ? data[currentIndex - 1] : null

  // Check if this is the current/latest period (would show "Estimated" for profit)
  const isCurrentPeriod = currentIndex === data.length - 1

  // Handle view type change
  const handleViewChange = useCallback((newView: 'month' | 'quarter' | 'year') => {
    setViewType(newView)
    if (newView === 'month') {
      setCurrentIndex(7) // August
    } else if (newView === 'quarter') {
      setCurrentIndex(2) // Q3
    } else {
      setCurrentIndex(2) // 2025
    }
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
    <div className="w-full max-w-[942px] mx-auto">
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
        <div>
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
        </div>
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
  const previousProfit = previousPeriod ? previousPeriod.revenue - previousPeriod.costs : undefined
  const expensesPercent = Math.min(90, Math.max(10, (data.costs / data.revenue) * 100))
  const profitPercent = 100 - expensesPercent

  // Calculate accurate percentage changes
  const revenueChange = calcPercentChange(data.revenue, previousPeriod?.revenue)
  const costsChange = calcPercentChange(data.costs, previousPeriod?.costs)
  const profitChange = calcPercentChange(profit, previousProfit)

  const isNetLoss = profit < 0
  const profitLabel = isNetLoss
    ? (isCurrentPeriod ? 'Est. Net Loss' : 'Net Loss')
    : (isCurrentPeriod ? 'Estimated Profit' : 'Profit')

  const [hoveredSegment, setHoveredSegment] = useState<'costs' | 'profit' | null>(null)

  return (
    <div className="px-6 pb-6">
      {/* Three metric cards */}
      <div className="flex gap-4 mb-8">
        {/* Revenue Card */}
        <MetricCard
          icon={CreditCard}
          iconColor="#467c75"
          label="Revenue"
          value={data.revenue}
          valueColor="text-black"
          change={revenueChange}
          actionLabel="Tell Me More"
        />

        {/* Costs Card */}
        <MetricCard
          icon={Wallet}
          iconColor="#b68b69"
          label="Costs"
          value={data.costs}
          valueColor="text-[#b68b69]"
          change={costsChange}
          invertChangeColor
          actionLabel="Tell Me More"
        />

        {/* Profit/Loss Card */}
        <MetricCard
          icon={FileSpreadsheet}
          iconColor={isNetLoss ? '#dc2626' : '#467c75'}
          label={profitLabel}
          value={Math.abs(profit)}
          valueColor={isNetLoss ? 'text-[#dc2626]' : 'text-[#467c75]'}
          change={profitChange}
          actionLabel="Tell Me More"
        />
      </div>

      {/* Horizontal stacked bar - 48px height with hover states and 8px border radius */}
      <div className="relative h-12 rounded-lg overflow-hidden flex">
        {/* Costs segment */}
        <div
          className="h-full bg-[#b68b69] rounded-l-lg cursor-pointer transition-opacity"
          style={{
            width: `${expensesPercent}%`,
            opacity: hoveredSegment === 'profit' ? 0.6 : 1
          }}
          onMouseEnter={() => setHoveredSegment('costs')}
          onMouseLeave={() => setHoveredSegment(null)}
        />
        {/* Profit segment */}
        <div
          className={`h-full rounded-r-lg cursor-pointer transition-opacity ${isNetLoss ? 'bg-[#dc2626]' : 'bg-[#467c75]'}`}
          style={{
            width: `${profitPercent}%`,
            opacity: hoveredSegment === 'costs' ? 0.6 : 1
          }}
          onMouseEnter={() => setHoveredSegment('profit')}
          onMouseLeave={() => setHoveredSegment(null)}
        />

        {/* Hover tooltip */}
        {hoveredSegment && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#161a1a] text-white px-3 py-2 rounded-lg shadow-xl pointer-events-none z-10">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: hoveredSegment === 'costs' ? '#b68b69' : (isNetLoss ? '#dc2626' : '#467c75') }}
              />
              <span className="text-[13px] text-[#c1c5c5] font-['Poppins']">
                {hoveredSegment === 'costs' ? 'Costs' : (isNetLoss ? 'Net Loss' : profitLabel)}:
              </span>
              <span className="text-[14px] font-medium font-['Poppins']">
                ${(hoveredSegment === 'costs' ? data.costs : Math.abs(profit)).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
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
}

function MetricCard({
  icon: Icon,
  iconColor,
  label,
  value,
  valueColor,
  change,
  invertChangeColor = false,
  actionLabel
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

      {/* Change badge */}
      <div className="mt-2 mb-3">
        <span className={`text-[13px] font-semibold font-['Poppins'] ${isGood ? 'text-[#4e8a59]' : 'text-[#dc2626]'}`}>
          {change.value}
        </span>
        <span className="text-[13px] text-[var(--color-neutral-n-600)] font-['Poppins']">
          {' '}from last month
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
  const previousProfit = previousPeriod ? previousPeriod.revenue - previousPeriod.costs : undefined

  // Calculate accurate percentage changes
  const revenueChange = calcPercentChange(data.revenue, previousPeriod?.revenue)
  const costsChange = calcPercentChange(data.costs, previousPeriod?.costs)
  const profitChange = calcPercentChange(profit, previousProfit)

  const isNetLoss = profit < 0
  const profitLabel = isNetLoss
    ? (isCurrentPeriod ? 'Est. Net Loss' : 'Net Loss')
    : (isCurrentPeriod ? 'Estimated Profit' : 'Profit')

  const periodLabel = viewType === 'quarter' ? 'from last quarter' : 'from last year'

  return (
    <div className="px-6 pb-6">
      {/* Three metric cards */}
      <div className="flex gap-4 mb-8">
        {/* Revenue Card */}
        <MetricCardCompact
          icon={CreditCard}
          iconColor="#467c75"
          label="Revenue"
          value={data.revenue}
          valueColor="text-black"
          change={revenueChange}
          periodLabel={periodLabel}
          actionLabel="Tell Me More"
        />

        {/* Costs Card */}
        <MetricCardCompact
          icon={Wallet}
          iconColor="#b68b69"
          label="Costs"
          value={data.costs}
          valueColor="text-[#b68b69]"
          change={costsChange}
          invertChangeColor
          periodLabel={periodLabel}
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
          periodLabel={periodLabel}
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
  // Generate weekly data for quarter or monthly data for year
  const chartData = useMemo(() => {
    if (viewType === 'year') {
      // For year view, use monthly data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return months.map((month, idx) => {
        // Generate realistic profit/loss data
        const baseProfit = 2000 + Math.sin(idx / 2) * 1500
        const variance = (Math.random() - 0.5) * 2000
        const profit = Math.round(baseProfit + variance)
        return {
          label: month,
          dateRange: month,
          profit,
          isProfit: profit > 0,
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

      const weeks: Array<{ label: string; dateRange: string; profit: number; isProfit: boolean; isMonthStart?: boolean; monthLabel?: string }> = []

      // Generate actual date ranges for weeks
      let dayOfMonth = 1
      months.forEach((month, monthIdx) => {
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        const monthDays = daysInMonth[(quarterNumber ? (quarterNumber - 1) * 3 : 6) + monthIdx]
        let weekInMonth = 0

        while (dayOfMonth <= monthDays) {
          const startDay = dayOfMonth
          const endDay = Math.min(dayOfMonth + 6, monthDays)
          const baseProfit = 500 + Math.sin((monthIdx * 5 + weekInMonth) / 3) * 400
          const variance = (Math.random() - 0.5) * 600
          const profit = Math.round(baseProfit + variance)

          weeks.push({
            label: `${startDay}-${endDay}`, // Just days for x-axis label
            dateRange: `${month} ${startDay}-${endDay}`, // Full date for tooltip
            profit,
            isProfit: profit > 0,
            isMonthStart: weekInMonth === 0,
            monthLabel: month, // Always include month for reference labels
          })

          dayOfMonth = endDay + 1
          weekInMonth++
        }
        dayOfMonth = 1 // Reset for next month
      })

      return weeks
    }
  }, [viewType, quarterNumber])

  // Calculate domain for chart
  const maxValue = Math.max(...chartData.map(d => Math.abs(d.profit)))
  const roundedMax = Math.ceil(maxValue / 500) * 500

  // Find month separator indices and labels for quarter view
  // The dotted line appears BETWEEN months (at the start of month 2 and 3, not month 1)
  // The label shows the month that's starting after the line
  const monthSeparators = useMemo(() => {
    if (viewType !== 'quarter') return []
    return chartData
      .map((d, idx) => d.isMonthStart && idx > 0 ? { idx, label: d.monthLabel || '' } : null)
      .filter((item): item is { idx: number; label: string } => item !== null)
  }, [chartData, viewType])

  // Get profit label for tooltip
  const getProfitLabel = (value: number) => {
    if (value < 0) {
      return isCurrentPeriod ? 'Est. Loss' : 'Net Loss'
    }
    return isCurrentPeriod ? 'Est. Profit' : 'Profit'
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
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{
            fill: '#8d9291',
            fontSize: 11,
            fontFamily: 'Poppins',
          }}
          interval={viewType === 'year' ? 0 : 'preserveStartEnd'}
        />
        <YAxis hide domain={[-roundedMax * 0.3, roundedMax]} />

        {/* Month separator lines with labels for quarter view */}
        {monthSeparators.map(({ idx, label }) => (
          <ReferenceLine
            key={`sep-${idx}`}
            x={chartData[idx]?.label}
            stroke="#e5e7e7"
            strokeWidth={1}
            strokeDasharray="4 4"
            label={{
              value: label,
              position: 'insideTopLeft',
              fill: '#8d9291',
              fontSize: 11,
              fontFamily: 'Poppins',
              dy: -8,
              dx: 4,
            }}
          />
        ))}

        <ChartTooltip
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null
            const dataPoint = payload[0].payload
            const profit = dataPoint.profit

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
                    {getProfitLabel(profit)}:
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

// View Selector Component
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
    <div className="flex items-center bg-white border border-[var(--color-neutral-g-100)] rounded-full p-1">
      {views.map(({ label, value }) => {
        const isActive = value === currentView

        if (isActive) {
          return (
            <DropdownMenu key={value} open={isOpen} onOpenChange={setIsOpen} modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1 px-3 py-0.5 rounded-full text-[15px] font-['Poppins'] cursor-pointer transition-all bg-[var(--color-neutral-g-100)] text-[var(--color-primary-p-500)] font-semibold tracking-[-0.3px]"
                >
                  {label}
                  <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
            className="px-3 py-0.5 rounded-full text-[15px] font-['Poppins'] cursor-pointer transition-all text-[var(--color-neutral-n-700)] hover:text-[#467c75] tracking-[-0.3px]"
          >
            {label}
          </button>
        )
      })}
    </div>
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
