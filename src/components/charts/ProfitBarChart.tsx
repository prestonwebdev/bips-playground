import { useMemo } from 'react'
import {
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, Cell, ReferenceLine, LabelList, CartesianGrid } from 'recharts'
import {
  SIMULATED_MONTH,
  SIMULATED_DAY,
  monthlyFinancialData,
} from '@/lib/quarterly-data'

/**
 * Calculate nice round tick values for Y-axis
 */
function getNiceTickValues(min: number, max: number, targetTickCount: number = 4): number[] {
  const range = max - min
  const roughStep = range / (targetTickCount - 1)

  // Find a nice round step value
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)))
  const residual = roughStep / magnitude

  let niceStep: number
  if (residual <= 1.5) niceStep = magnitude
  else if (residual <= 3) niceStep = 2 * magnitude
  else if (residual <= 7) niceStep = 5 * magnitude
  else niceStep = 10 * magnitude

  // Calculate nice min and max
  const niceMin = Math.floor(min / niceStep) * niceStep
  const niceMax = Math.ceil(max / niceStep) * niceStep

  // Generate ticks
  const ticks: number[] = []
  for (let tick = niceMin; tick <= niceMax; tick += niceStep) {
    ticks.push(tick)
  }

  return ticks
}

/**
 * Calculate symmetric tick values for charts with negative values
 */
function getSymmetricTickValues(min: number, max: number): number[] {
  const absMax = Math.max(Math.abs(min), Math.abs(max))
  const ticks = getNiceTickValues(0, absMax, 3)

  // Create symmetric ticks: negative, 0, positive
  const negativeTicks = ticks.filter(t => t > 0).map(t => -t).reverse()
  const positiveTicks = ticks.filter(t => t > 0)

  return [...negativeTicks, 0, ...positiveTicks]
}

/**
 * Chart Colors - matching the existing design system
 */
export const CHART_COLORS = {
  revenue: '#2a4a47',
  costs: '#b68b69',  // Darker tan for costs/loss
  profit: '#467c75', // Brand color for profit
  loss: '#b68b69',   // Same tan for loss bars
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

// Profit Bar Chart for Month/Quarter/Year view
export interface ProfitBarChartProps {
  data?: Array<{
    date: string
    revenue: number
    costs: number
    cash: number
  }>  // Kept for type compatibility but not used - data is generated internally
  viewType: 'month' | 'quarter' | 'year' | 'monthlyComparison'
  quarterNumber?: number
  monthNumber?: number  // 0-11 for month index
  isCurrentPeriod?: boolean
  className?: string
  height?: string
}

export function ProfitBarChart({ viewType, quarterNumber, monthNumber, className = '', height = 'h-[200px]' }: ProfitBarChartProps) {
  // Use simulated date (Dec 9, 2025) for determining if a period has passed
  const currentMonth = SIMULATED_MONTH
  const currentDay = SIMULATED_DAY

  // Generate daily/weekly/monthly data based on view type
  const chartData = useMemo(() => {
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

        // Future days have no data yet - show nothing
        if (isFuture) {
          days.push({
            label: `${day}`,
            dateRange: `${monthName} ${day}`,
            profit: 0, // No bar for future days
            revenue: 0,
            costs: 0,
            isProfit: true,
            uniqueKey: `d${day}`,
            isPast: false,
            isFuture: true,
            isToday: false,
            hasNoTransactions: false,
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
          profit = 5 // Minimal placeholder value for bar height
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
    } else if (viewType === 'monthlyComparison') {
      // For monthly comparison view, show just this month and last month
      // Pull from the same monthlyFinancialData used for totals
      const targetMonth = monthNumber ?? currentMonth
      const lastMonth = targetMonth === 0 ? 11 : targetMonth - 1

      const months = [lastMonth, targetMonth]
      return months.map((monthIdx, idx) => {
        const isPreviousInComparison = idx === 0 // First bar is the previous month
        const isPast = monthIdx < currentMonth

        // Get actual data from monthlyFinancialData
        const monthData = monthlyFinancialData[monthIdx]
        const revenue = monthData?.revenue ?? 0
        const costs = monthData?.costs ?? 0
        const profit = revenue - costs

        return {
          label: shortMonthNames[monthIdx],
          dateRange: `${shortMonthNames[monthIdx]} 2025`,
          profit,
          revenue,
          costs,
          isProfit: profit > 0,
          uniqueKey: `m${monthIdx}`,
          isPast,
          isFuture: false,
          isToday: false,
          hasNoTransactions: false,
          isPreviousInComparison, // Flag for styling previous month as gray
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

  // Calculate gap value (about 1px worth of the chart range)
  const totalRange = roundedMax - roundedMin
  const gapValue = totalRange * 0.005 // 0.5% of range for minimal gap

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
      .map((d, idx) => ('isMonthStart' in d && d.isMonthStart) ? { idx, label: ('monthLabel' in d ? d.monthLabel : '') || '' } : null)
      .filter((item): item is { idx: number; label: string } => item !== null)
  }, [chartData, viewType])

  // Find "Today" indicator for month view - positioned at today's bar
  const todayIndicator = useMemo(() => {
    if (viewType !== 'month') return null
    const todayIndex = chartData.findIndex((d) => 'isToday' in d && d.isToday)
    if (todayIndex === -1) return null
    // Check if today is near the end of the chart (last 3 days)
    const isAtEnd = todayIndex >= chartData.length - 3
    return {
      idx: todayIndex,
      label: chartData[todayIndex]?.label || '',
      uniqueKey: chartData[todayIndex]?.uniqueKey || `d${todayIndex + 1}`,
      isAtEnd,
    }
  }, [chartData, viewType])

  // Check if "This Month" indicator is at end for year view
  const thisMonthIsAtEnd = useMemo(() => {
    if (viewType !== 'year') return false
    // Current month is at end if it's the last month shown (December = 11)
    return currentMonth >= 10 // Oct, Nov, Dec are considered "at end"
  }, [viewType, currentMonth])

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
    <ChartContainer config={chartConfig} className={`${height} w-full ${className}`}>
      <BarChart
        data={chartDataWithGap}
        margin={{ top: 30, right: 8, bottom: 30, left: 8 }}
        barCategoryGap={viewType === 'year' ? '20%' : '15%'}
      >
        <XAxis
          dataKey={viewType === 'quarter' ? 'uniqueKey' : 'label'}
          tickLine={false}
          axisLine={false}
          tick={true}
          fontSize={11}
          fontFamily="Poppins"
          stroke="#8d9291"
        />
        <YAxis
          domain={[roundedMin - gapValue, roundedMax + gapValue]}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fontFamily: 'Poppins', fill: '#8d9291' }}
          tickFormatter={(value) => {
            if (Math.abs(value) < 10) return '0'
            const absValue = Math.abs(value)
            if (absValue >= 1000) {
              return `${value < 0 ? '-' : ''}$${(absValue / 1000).toFixed(0)}K`
            }
            return `${value < 0 ? '-' : ''}$${absValue.toFixed(0)}`
          }}
          ticks={hasNegativeValues
            ? getSymmetricTickValues(roundedMin, roundedMax)
            : getNiceTickValues(0, roundedMax)
          }
          width={45}
        />

        {/* Horizontal grid lines for Y-axis guides */}
        <CartesianGrid
          horizontal={true}
          vertical={false}
          stroke="var(--color-neutral-g-100)"
        />

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
            position="end"
            label={{
              value: 'Today',
              position: 'top',
              fill: '#8d9291',
              fontSize: 11,
              fontFamily: 'Poppins',
              dy: -8,
              dx: todayIndicator.isAtEnd ? -28 : 20,
            }}
          />
        )}

        {/* "This Month" indicator line for year view */}
        {viewType === 'year' && (
          <ReferenceLine
            x={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][currentMonth]}
            stroke="#c1c5c5"
            strokeWidth={1}
            strokeDasharray="4 4"
            position="end"
            label={{
              value: 'This Month',
              position: 'top',
              fill: '#8d9291',
              fontSize: 11,
              fontFamily: 'Poppins',
              dy: -8,
              dx: thisMonthIsAtEnd ? -58 : 32,
            }}
          />
        )}

        {/* Dashed zero line for profit chart */}
        {hasNegativeValues && (
          <ReferenceLine
            y={0}
            stroke="var(--color-neutral-g-200)"
            strokeWidth={1}
            strokeDasharray="3 3"
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
                <div className="rounded-lg bg-white/90 backdrop-blur-[3px] border border-[var(--color-neutral-g-100)] px-3 py-2 shadow-[0px_5px_13px_0px_rgba(0,0,0,0.04),0px_20px_24px_0px_rgba(0,0,0,0.06)]">
                  <p className="mb-1 text-[13px] text-[var(--color-neutral-n-600)] font-['Poppins']">
                    {dataPoint.dateRange}
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: '#e5e7e7' }}
                    />
                    <span className="text-[13px] text-[var(--color-neutral-n-500)] font-['Poppins']">
                      No transactions
                    </span>
                  </div>
                </div>
              )
            }

            const revenue = dataPoint.revenue ?? 0
            const costs = dataPoint.costs ?? 0
            const profitMargin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0

            return (
              <div className="rounded-lg bg-white/90 backdrop-blur-[3px] border border-[var(--color-neutral-g-100)] px-3 py-2 shadow-[0px_5px_13px_0px_rgba(0,0,0,0.04),0px_20px_24px_0px_rgba(0,0,0,0.06)] min-w-[180px]">
                <p className="mb-2 text-[15px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins']">
                  {dataPoint.dateRange}
                </p>
                {/* Profit/Loss */}
                <div className="flex items-center justify-between gap-4 mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: profit > 0 ? CHART_COLORS.profit : CHART_COLORS.loss }}
                    />
                    <span className="text-[14px] text-[var(--color-neutral-n-600)] font-['Poppins']">
                      {getProfitLabel(profit, isPast)}
                    </span>
                  </div>
                  <span className="text-[14px] font-semibold text-[var(--color-neutral-n-800)] font-['Poppins']">
                    ${Math.abs(profit).toLocaleString()}
                  </span>
                </div>
                {/* Costs */}
                <div className="flex items-center justify-between gap-4 mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: CHART_COLORS.costs }}
                    />
                    <span className="text-[14px] text-[var(--color-neutral-n-600)] font-['Poppins']">
                      Costs
                    </span>
                  </div>
                  <span className="text-[14px] font-semibold text-[var(--color-neutral-n-800)] font-['Poppins']">
                    ${costs.toLocaleString()}
                  </span>
                </div>
                {/* Profit Margin */}
                <div className="flex items-center justify-between gap-4 pt-1 border-t border-[var(--color-neutral-g-100)]">
                  <span className="text-[14px] text-[var(--color-neutral-n-600)] font-['Poppins']">
                    Profit Margin
                  </span>
                  <span className={`text-[14px] font-semibold font-['Poppins'] ${profit >= 0 ? 'text-[var(--color-primary-p-500)]' : 'text-[#b68b69]'}`}>
                    {profit >= 0 ? '' : '-'}{Math.abs(profitMargin)}%
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
            const isPreviousInComparison = 'isPreviousInComparison' in entry && entry.isPreviousInComparison
            let fill: string
            if (hasNoTransactions) {
              fill = '#e5e7e7' // Light grey for no transactions
            } else if (isPreviousInComparison) {
              fill = '#c1c5c5' // Light gray for previous month in comparison
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

export default ProfitBarChart
