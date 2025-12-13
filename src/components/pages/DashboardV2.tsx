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
  Sparkles,
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
import { TopSpendingV2 } from '@/components/overview/TopSpendingV2'

/**
 * Chart Colors - matching the existing design system
 */
const CHART_COLORS = {
  revenue: '#2a4a47',
  costs: '#b68b69',
  profit: '#467c75',
  loss: '#b68b69',
} as const

const chartConfig = {
  revenue: {
    label: 'Income',
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
 * DashboardV2 - New dashboard design with side-by-side chart and spending list
 *
 * Features:
 * - Welcome message at top
 * - Navigation arrows and time period toggle (Month/Year)
 * - Summary tiles in a row (Income, Costs, Estimated Profit)
 * - Business Performance chart alongside Top Spending list
 * - Action buttons for P&L Report and Insights
 */
function getCurrentPeriodIndex(viewType: 'month' | 'quarter' | 'year'): number {
  switch (viewType) {
    case 'month':
      return SIMULATED_MONTH
    case 'quarter':
      return Math.floor(SIMULATED_MONTH / 3)
    case 'year':
      return SIMULATED_YEAR - 2023
  }
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

export default function DashboardV2() {
  const [viewType, setViewType] = useState<'month' | 'quarter' | 'year'>('month')
  const [currentIndex, setCurrentIndex] = useState(() => getCurrentPeriodIndex('month'))
  const [, setDirection] = useState<'left' | 'right'>('right')

  const data = getFinancialDataByView(viewType)
  const currentPeriod: FinancialPeriod = data[currentIndex] || data[0]
  const previousPeriod: FinancialPeriod | null = currentIndex > 0 ? data[currentIndex - 1] : null

  const handleViewChange = useCallback((newView: 'month' | 'quarter' | 'year') => {
    setViewType(newView)
    setCurrentIndex(getCurrentPeriodIndex(newView))
    setDirection('right')
  }, [])

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

  const handlePeriodSelect = useCallback((periodId: string) => {
    const newIndex = data.findIndex(p => p.id === periodId)
    if (newIndex !== -1 && newIndex !== currentIndex) {
      setDirection(newIndex > currentIndex ? 'right' : 'left')
      setCurrentIndex(newIndex)
    }
  }, [data, currentIndex])

  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < data.length - 1

  const userName = 'Preston'

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const profit = currentPeriod.revenue - currentPeriod.costs
  const isNetLoss = profit < 0

  // Calculate change percentages
  const previousProfit = previousPeriod ? previousPeriod.revenue - previousPeriod.costs : undefined
  const revenueChange = calcPercentChange(currentPeriod.revenue, previousPeriod?.revenue)
  const costsChange = calcPercentChange(currentPeriod.costs, previousPeriod?.costs)
  const profitChange = calcPercentChange(profit, previousProfit)

  // Get comparison label based on view type
  const comparisonLabel = viewType === 'month' ? 'from last month' : viewType === 'quarter' ? 'from last quarter' : 'from last year'

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

      {/* Main Card - Contains everything */}
      <Card className="bg-white rounded-[16px] border-[var(--color-neutral-g-100)] overflow-hidden shadow-[-83px_122px_41px_0px_rgba(0,0,0,0),-53px_78px_38px_0px_rgba(0,0,0,0),-30px_44px_32px_0px_rgba(0,0,0,0.01),-13px_20px_24px_0px_rgba(0,0,0,0.02),-3px_5px_13px_0px_rgba(0,0,0,0.02)]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <p className="text-[14px] text-[var(--color-neutral-n-600)] font-['Poppins'] leading-[20px] tracking-[-0.28px]">
            Financial Overview
          </p>
          <h2 className="text-[32px] font-normal text-black font-['Poppins'] leading-[44px] tracking-[-0.64px]">
            {currentPeriod.periodLabel}
          </h2>
        </div>

        {/* Summary Tiles Row */}
        <div className="flex gap-4 px-6 pb-0">
          {/* Income Card */}
          <MetricCardCompact
            icon={CreditCard}
            iconColor="#467c75"
            label="Income"
            value={currentPeriod.revenue}
            valueColor="text-black"
            change={revenueChange}
            periodLabel={comparisonLabel}
            actionLabel="Tell Me More"
          />

          {/* Costs Card */}
          <MetricCardCompact
            icon={Wallet}
            iconColor="#b68b69"
            label="Costs"
            value={currentPeriod.costs}
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
            label={isNetLoss ? 'Net Loss' : 'Estimated Profit'}
            value={Math.abs(profit)}
            valueColor={isNetLoss ? 'text-[#dc2626]' : 'text-[#467c75]'}
            change={profitChange}
            periodLabel={comparisonLabel}
            actionLabel="Tell Me More"
          />
        </div>

        {/* Chart and Spending List Side by Side */}
        <div className="flex gap-4 px-6 py-4">
          {/* Business Performance Chart */}
          <div className="flex-[2] bg-white rounded-[12px] border border-[var(--color-neutral-g-100)] p-5">
            <h3 className="text-[14px] font-medium text-black font-['Poppins'] mb-4">
              Business Performance
            </h3>
            <ProfitBarChartCompact
              viewType={viewType}
              monthNumber={currentPeriod.month}
              quarterNumber={currentPeriod.quarter}
            />
          </div>

          {/* Top Spending List */}
          <div className="flex-1 bg-white rounded-[12px] border border-[var(--color-neutral-g-100)] p-5">
            <TopSpendingV2 />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 px-6 pb-6">
          <ActionButton icon={FileSpreadsheet} label="Generate P&L Report" />
          <ActionButton icon={Sparkles} label="View Insights" />
        </div>
      </Card>
    </div>
  )
}

// Compact Profit Bar Chart for side-by-side layout
interface ProfitBarChartCompactProps {
  viewType: 'month' | 'quarter' | 'year'
  quarterNumber?: number
  monthNumber?: number
}

function ProfitBarChartCompact({ viewType, quarterNumber, monthNumber }: ProfitBarChartCompactProps) {
  const currentMonth = SIMULATED_MONTH
  const currentDay = SIMULATED_DAY

  const chartData = useMemo(() => {
    const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    if (viewType === 'month') {
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      const targetMonth = monthNumber ?? currentMonth
      const monthDays = daysInMonth[targetMonth]
      const monthName = shortMonthNames[targetMonth]
      const isThisCurrentMonth = targetMonth === currentMonth

      const days: Array<{ label: string; dateRange: string; profit: number; revenue: number; costs: number; isProfit: boolean; uniqueKey: string; isPast: boolean; isFuture: boolean; isToday: boolean; hasNoTransactions: boolean }> = []

      const seed = targetMonth * 1000
      const seededRandom = (day: number) => {
        const x = Math.sin(seed + day) * 10000
        return x - Math.floor(x)
      }

      for (let day = 1; day <= monthDays; day++) {
        const isPast = targetMonth < currentMonth || (isThisCurrentMonth && day < currentDay)
        const isFuture = isThisCurrentMonth && day > currentDay
        const isToday = isThisCurrentMonth && day === currentDay

        if (isFuture) {
          days.push({
            label: `${day}`,
            dateRange: `${monthName} ${day}`,
            profit: 20,
            revenue: 0,
            costs: 0,
            isProfit: true,
            uniqueKey: `d${day}`,
            isPast: false,
            isFuture: true,
            isToday: false,
            hasNoTransactions: true,
          })
          continue
        }

        const rand = seededRandom(day)
        let profit: number
        let revenue: number
        let costs: number
        let hasNoTransactions = false
        let isLoss = false

        if (rand < 0.15) {
          profit = 20
          revenue = 0
          costs = 0
          hasNoTransactions = true
        } else if (rand < 0.35) {
          revenue = 200 + Math.round(seededRandom(day * 2) * 400)
          costs = revenue + 100 + Math.round(seededRandom(day * 3) * 400)
          profit = revenue - costs
          isLoss = true
        } else {
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
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

      const seededRandom = (seed: number) => {
        const x = Math.sin(seed * 9999) * 10000
        return x - Math.floor(x)
      }

      return months
        .filter((_, idx) => idx <= currentMonth)
        .map((month, idx) => {
          const isCurrentMonth = idx === currentMonth
          const partialFraction = isCurrentMonth ? currentDay / 31 : 1
          const rand = seededRandom(idx + 100)

          let revenue: number
          let costs: number
          let profit: number

          if (rand < 0.25) {
            revenue = Math.round((8000 + seededRandom(idx * 2) * 4000) * partialFraction)
            costs = Math.round((revenue + 50 + seededRandom(idx * 3) * 200) * partialFraction)
            profit = revenue - costs
          } else {
            const baseRevenue = 20000 + Math.sin(idx / 2) * 5000
            const baseCosts = 15000 + Math.sin(idx / 3) * 3000
            const variance = seededRandom(idx * 4) * 4000 - 2000
            revenue = Math.round((baseRevenue + variance) * partialFraction)
            costs = Math.round((baseCosts + variance * 0.5) * partialFraction)
            profit = revenue - costs
          }

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
      const quarterMonths = [
        ['Jan', 'Feb', 'Mar'],
        ['Apr', 'May', 'Jun'],
        ['Jul', 'Aug', 'Sep'],
        ['Oct', 'Nov', 'Dec'],
      ]
      const months = quarterNumber ? quarterMonths[quarterNumber - 1] : quarterMonths[2]

      const weeks: Array<{ label: string; dateRange: string; profit: number; revenue: number; costs: number; isProfit: boolean; isMonthStart?: boolean; monthLabel?: string; uniqueKey: string; isPast: boolean }> = []

      let dayOfMonth = 1
      let weekIndex = 0
      months.forEach((month, monthIdx) => {
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        const actualMonthIndex = (quarterNumber ? (quarterNumber - 1) * 3 : 6) + monthIdx
        const monthDays = daysInMonth[actualMonthIndex]
        let weekInMonth = 0

        if (actualMonthIndex > currentMonth) {
          return
        }

        while (dayOfMonth <= monthDays) {
          const startDay = dayOfMonth
          const endDay = Math.min(dayOfMonth + 6, monthDays)

          if (actualMonthIndex === currentMonth && startDay > currentDay) {
            dayOfMonth = endDay + 1
            weekInMonth++
            weekIndex++
            continue
          }

          const baseRevenue = 5000 + Math.sin((monthIdx * 5 + weekInMonth) / 3) * 2000
          const baseCosts = 3500 + Math.sin((monthIdx * 3 + weekInMonth) / 2) * 1000
          const variance = (Math.random() - 0.5) * 1500
          const revenue = Math.round(baseRevenue + variance)
          const costs = Math.round(baseCosts + variance * 0.5)
          const profit = revenue - costs

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
        dayOfMonth = 1
      })

      return weeks
    }
  }, [viewType, quarterNumber, monthNumber, currentMonth, currentDay])

  const hasNegativeValues = chartData.some(d => d.profit < 0)
  const maxValue = Math.max(...chartData.map(d => Math.abs(d.profit)))
  const minValue = hasNegativeValues ? Math.min(...chartData.map(d => d.profit)) : 0
  const roundedMax = Math.ceil(maxValue / 500) * 500
  const roundedMin = hasNegativeValues ? Math.floor(minValue / 500) * 500 : 0
  const totalRange = roundedMax - roundedMin
  const gapValue = totalRange * 0.015

  const chartDataWithGap = chartData.map(d => ({
    ...d,
    displayProfit: d.profit > 0 ? d.profit + gapValue : d.profit < 0 ? d.profit - gapValue : d.profit,
  }))

  const monthSeparators = useMemo(() => {
    if (viewType !== 'quarter') return []
    return chartData
      .map((d, idx) => ('isMonthStart' in d && d.isMonthStart) ? { idx, label: ('monthLabel' in d ? d.monthLabel : '') || '' } : null)
      .filter((item): item is { idx: number; label: string } => item !== null)
  }, [chartData, viewType])

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

  const getProfitLabel = (value: number, isPast: boolean) => {
    if (value < 0) {
      return isPast ? 'Net Loss' : 'Loss to Date'
    }
    return isPast ? 'Profit' : 'Profit to Date'
  }

  // Custom label for bars - show dollar values above bars (same as V1)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomLabel = (props: any) => {
    const { x = 0, y = 0, width = 0, height = 0, index = 0 } = props

    const dataPoint = chartDataWithGap[index]
    const hasNoTransactions = dataPoint && 'hasNoTransactions' in dataPoint && dataPoint.hasNoTransactions
    const isFuture = dataPoint && 'isFuture' in dataPoint && dataPoint.isFuture

    const originalProfit = dataPoint?.profit ?? 0

    if (originalProfit === 0 || hasNoTransactions || isFuture) return null

    const absValue = Math.abs(originalProfit)
    const sign = originalProfit < 0 ? '-' : ''
    const formatted = absValue >= 1000
      ? `${sign}$${(absValue / 1000).toFixed(1)}K`
      : `${sign}$${absValue}`

    const isProfit = originalProfit > 0
    const fill = isProfit ? '#467c75' : CHART_COLORS.loss

    let labelY: number
    if (isProfit) {
      labelY = y - 6
    } else {
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

        <ReferenceLine y={0} stroke="#e5e7e7" strokeWidth={1} strokeDasharray="4 4" />

        {monthSeparators.map(({ idx, label }, sepIndex) => (
          <ReferenceLine
            key={`sep-${idx}`}
            x={chartData[idx]?.uniqueKey || chartData[idx]?.label}
            stroke="#c1c5c5"
            strokeWidth={1}
            strokeDasharray="4 4"
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
            const isPast = dataPoint.isPast ?? true
            const hasNoTransactions = dataPoint.hasNoTransactions ?? false
            const isFuture = dataPoint.isFuture ?? false

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
                <div className="flex items-center justify-between gap-4 mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: CHART_COLORS.revenue }}
                    />
                    <span className="text-[13px] text-[#c1c5c5] font-['Poppins']">
                      Income
                    </span>
                  </div>
                  <span className="text-[13px] font-medium text-white font-['Poppins']">
                    ${revenue.toLocaleString()}
                  </span>
                </div>
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
            const hasNoTransactions = 'hasNoTransactions' in entry && entry.hasNoTransactions
            let fill: string
            if (hasNoTransactions) {
              fill = '#e5e7e7'
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

// Compact Metric Card (same as V1)
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
                    <motion.div
                      layoutId="activeTabIndicatorV2"
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

// Action Button Component
function ActionButton({
  icon: Icon,
  label,
}: {
  icon: typeof FileSpreadsheet
  label: string
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[var(--color-neutral-g-200)] bg-white text-[var(--color-neutral-n-700)] hover:bg-[var(--color-neutral-g-50)] transition-colors"
    >
      <Icon className="w-5 h-5" />
      <span className="text-[13px] font-['Poppins'] tracking-[-0.26px]">{label}</span>
    </motion.button>
  )
}
