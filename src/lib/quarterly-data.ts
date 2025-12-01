/**
 * Quarterly Financial Data
 *
 * Mock data for the stacking cards dashboard view.
 * Each card represents a financial period (month/quarter/year).
 */

/**
 * SIMULATION DATE
 * The entire dashboard simulates this date as "today"
 * This allows us to show realistic partial-month data for December
 */
export const SIMULATED_DATE = new Date(2025, 11, 9) // December 9, 2025
export const SIMULATED_MONTH = 11 // December (0-indexed)
export const SIMULATED_DAY = 9
export const SIMULATED_YEAR = 2025

export interface MonthlyBreakdown {
  month: string        // "Jan", "Feb", etc.
  revenue: number
  costs: number
}

export interface DailyDataPoint {
  date: string         // "8/1", "8/11", etc.
  revenue: number
  costs: number
  cash: number
}

/**
 * Period-to-date comparison data
 * Used for comparing current period progress vs same point in previous period
 * e.g., Dec 1-3 revenue vs Nov 1-3 revenue (not full November)
 */
export interface PeriodToDateComparison {
  previousPeriodToDateRevenue: number   // Revenue for same days in previous period
  previousPeriodToDateCosts: number     // Costs for same days in previous period
  daysElapsed: number                    // Number of days into current period
  comparisonLabel: string                // e.g., "Nov 1-30" or "Q3 days 1-62"
}

export interface FinancialPeriod {
  id: string
  periodLabel: string  // "August 2025", "Q3 2025", "2025"
  periodType: 'month' | 'quarter' | 'year'
  quarter?: number     // 1-4 for quarters
  year: number
  month?: number       // 0-11 for months
  revenue: number
  costs: number
  cashOnHand: number
  insight: string
  uncategorizedTransactions: number
  monthlyBreakdown?: MonthlyBreakdown[]  // For quarters: 3 months breakdown
  dailyBreakdown?: DailyDataPoint[]       // For quarters/years: daily data for line chart
  periodToDateComparison?: PeriodToDateComparison  // For current period comparisons
}

// Helper to generate daily data points for a single month
function generateDailyDataForMonth(
  monthIndex: number,
  baseRevenue: number,
  baseCosts: number,
  baseCash: number,
  isNegativeMonth: boolean = false
): DailyDataPoint[] {
  const dataPoints: DailyDataPoint[] = []
  const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  const monthNum = monthIndex + 1
  const daysInMonth = daysPerMonth[monthIndex]

  // Sample every few days for cleaner chart
  for (let day = 1; day <= daysInMonth; day += 3) {
    const variance = Math.sin(day / 5) * 0.3 + (Math.random() - 0.5) * 0.4
    let dayRevenue = Math.round(baseRevenue * (1 + variance))
    let dayCosts = Math.round(baseCosts * (0.8 + Math.random() * 0.4))
    const dayCash = Math.round(baseCash * (0.9 + variance * 0.3))

    // For negative months, flip the relationship
    if (isNegativeMonth) {
      dayRevenue = Math.round(baseRevenue * 0.4 * (1 + variance))
      dayCosts = Math.round(baseCosts * 1.8 * (0.9 + Math.random() * 0.3))
    }

    dataPoints.push({
      date: `${monthNum}/${day}`,
      revenue: dayRevenue,
      costs: dayCosts,
      cash: dayCash,
    })
  }

  return dataPoints
}

// Helper to generate weekly data points for a quarter with variable months
function generateWeeklyDataForQuarter(
  startMonth: number,
  numMonths: number,
  baseRevenue: number,
  baseCosts: number,
  baseCash: number
): DailyDataPoint[] {
  const dataPoints: DailyDataPoint[] = []
  const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  // Generate weekly data for specified number of months
  let weekNum = 1
  for (let m = 0; m < numMonths; m++) {
    const monthIndex = (startMonth + m) % 12
    const monthNum = monthIndex + 1
    const daysInMonth = daysPerMonth[monthIndex]

    // Sample weekly (every 7 days roughly)
    for (let day = 1; day <= daysInMonth; day += 7) {
      const variance = Math.sin(weekNum / 3) * 0.3 + (Math.random() - 0.5) * 0.4
      const weekRevenue = Math.round(baseRevenue * (1 + variance))
      const weekCosts = Math.round(baseCosts * (0.8 + Math.random() * 0.4))
      const weekCash = Math.round(baseCash * (0.9 + variance * 0.3))

      dataPoints.push({
        date: `${monthNum}/${day}`,
        revenue: weekRevenue,
        costs: weekCosts,
        cash: weekCash,
      })
      weekNum++
    }
  }

  return dataPoints
}

// Helper to generate monthly data points for a year
// For 2025, excludes December (no data yet)
function generateMonthlyChartData(
  baseRevenue: number,
  baseCosts: number,
  baseCash: number,
  excludeDecember: boolean = false
): DailyDataPoint[] {
  const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthsToGenerate = excludeDecember ? shortMonthNames.slice(0, 11) : shortMonthNames

  return monthsToGenerate.map((month, index) => {
    const variance = Math.sin(index / 2) * 0.3 + (Math.random() - 0.5) * 0.3
    const seasonalFactor = 1 + Math.sin((index - 2) * Math.PI / 6) * 0.15 // Peak in summer

    return {
      date: month,
      revenue: Math.round(baseRevenue * seasonalFactor * (1 + variance)),
      costs: Math.round(baseCosts * (0.85 + Math.random() * 0.3)),
      cash: Math.round(baseCash * seasonalFactor * (0.9 + variance * 0.2)),
    }
  })
}

// Generate monthly data for 2025
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function generateMonthlyData(): FinancialPeriod[] {
  const baseRevenue = 24000
  const baseCosts = 4500
  const baseCash = 18000

  const insights = [
    'Strong start to the year with increased customer acquisitions.',
    'Marketing spend drove higher engagement this month.',
    'Cost optimization efforts showing positive results.',
    'Seasonal uptick in revenue from Q2 campaigns.',
    'Equipment investments supporting growth trajectory.',
    'Mid-year review shows healthy profit margins.',
    'Summer slowdown expected - revenue within normal range.',
    'It looks like you are spending a little bit more on advertising this month...',
    'Back-to-school season boosting sales figures.',
    'Strong Q4 preparation with strategic inventory buildup.',
    'Costs exceeded revenue this month. Major equipment repairs and seasonal slowdown impacted profitability.',
    'Year-end push with record-breaking sales potential.',
  ]

  return monthNames.map((month, index) => {
    // November (index 10) is a negative profitability month
    const isNovember = index === 10
    // December (index 11) has partial data through SIMULATED_DAY
    const isDecember = index === 11

    // Add realistic variance
    const revenueVariance = Math.floor((Math.random() - 0.3) * 8000)
    const costsVariance = Math.floor((Math.random() - 0.4) * 1500)

    // December: partial data through simulated day (Dec 9)
    if (isDecember) {
      // Calculate partial month values (9/31 of typical month)
      const partialFraction = SIMULATED_DAY / 31
      const decRevenue = Math.round((baseRevenue + revenueVariance) * partialFraction)
      const decCosts = Math.round((baseCosts + costsVariance) * partialFraction)
      const decCash = Math.round(baseCash * partialFraction)

      // Generate daily breakdown only through Dec 9
      const dailyBreakdown: DailyDataPoint[] = []
      for (let day = 1; day <= SIMULATED_DAY; day += 3) {
        const variance = Math.sin(day / 5) * 0.3 + (Math.random() - 0.5) * 0.4
        dailyBreakdown.push({
          date: `12/${day}`,
          revenue: Math.round(800 * (1 + variance)),
          costs: Math.round(150 * (0.8 + Math.random() * 0.4)),
          cash: Math.round(500 * (0.9 + variance * 0.3)),
        })
      }

      return {
        id: `month-${index}`,
        periodLabel: `${month} 2025`,
        periodType: 'month' as const,
        month: index,
        year: 2025,
        revenue: decRevenue,
        costs: decCosts,
        cashOnHand: decCash,
        insight: 'December in progress - showing data through the 9th.',
        uncategorizedTransactions: Math.floor(Math.random() * 8) + 2,
        dailyBreakdown,
      }
    }

    // November: low revenue, high costs
    const revenue = isNovember
      ? 12000 + Math.floor(Math.random() * 2000)  // Much lower revenue
      : baseRevenue + revenueVariance + (index * 200)
    const costs = isNovember
      ? 18500 + Math.floor(Math.random() * 1500)  // Much higher costs
      : baseCosts + costsVariance
    const cashOnHand = isNovember
      ? 8500  // Lower cash on hand
      : baseCash + (revenue - costs) * (index + 1) / 4

    // Generate daily breakdown for the line chart
    const dailyBreakdown = generateDailyDataForMonth(
      index,
      800,   // base daily revenue
      150,   // base daily costs
      500,   // base daily cash
      isNovember
    )

    return {
      id: `month-${index}`,
      periodLabel: `${month} 2025`,
      periodType: 'month' as const,
      month: index,
      year: 2025,
      revenue: Math.round(revenue),
      costs: Math.round(costs),
      cashOnHand: Math.round(cashOnHand),
      insight: insights[index],
      uncategorizedTransactions: Math.floor(Math.random() * 20) + 5,
      dailyBreakdown,
    }
  })
}

function generateQuarterlyData(): FinancialPeriod[] {
  const quarterInsights = [
    'Q1 showed solid foundation building with 12% YoY growth.',
    'Q2 momentum accelerated with new product launches.',
    'Q3 on track despite seasonal adjustments.',
    'Q4 in progress - October and November data included.',
  ]

  const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return [1, 2, 3, 4].map((quarter) => {
    const isQ4 = quarter === 4
    const baseRevenue = 72000 + (quarter - 1) * 5000
    const baseCosts = 13500 + (quarter - 1) * 800
    const revenueVariance = Math.floor((Math.random() - 0.3) * 15000)
    const costsVariance = Math.floor((Math.random() - 0.4) * 3000)

    // Generate monthly breakdown for this quarter
    // Q4 has Oct, Nov (full months) and Dec (partial through SIMULATED_DAY)
    const startMonth = (quarter - 1) * 3
    const monthsInQuarter = 3  // All quarters have 3 months displayed
    const monthlyBreakdown: MonthlyBreakdown[] = Array.from({ length: monthsInQuarter }, (_, offset) => {
      const monthIndex = startMonth + offset
      const isDecember = isQ4 && offset === 2 // December in Q4

      if (isDecember) {
        // December partial data (through Dec 9)
        const partialFraction = SIMULATED_DAY / 31
        const monthRevenue = Math.round((baseRevenue / 3) * partialFraction + (Math.random() - 0.5) * 2000)
        const monthCosts = Math.round((baseCosts / 3) * partialFraction + (Math.random() - 0.5) * 500)
        return {
          month: shortMonthNames[monthIndex],
          revenue: monthRevenue,
          costs: monthCosts,
        }
      }

      const monthRevenue = Math.round((baseRevenue / 3) + (Math.random() - 0.5) * 8000)
      const monthCosts = Math.round((baseCosts / 3) + (Math.random() - 0.5) * 2000)
      return {
        month: shortMonthNames[monthIndex],
        revenue: monthRevenue,
        costs: monthCosts,
      }
    })

    // Calculate totals from breakdown for consistency
    const totalRevenue = monthlyBreakdown.reduce((sum, m) => sum + m.revenue, 0)
    const totalCosts = monthlyBreakdown.reduce((sum, m) => sum + m.costs, 0)

    // Generate weekly breakdown for line chart (only for months with data)
    const dailyBreakdown = generateWeeklyDataForQuarter(
      startMonth,
      monthsInQuarter,
      7500,  // base weekly revenue
      1200,  // base weekly costs
      5000   // base weekly cash
    )

    return {
      id: `quarter-${quarter}`,
      periodLabel: `Q${quarter} 2025`,
      periodType: 'quarter' as const,
      quarter,
      year: 2025,
      revenue: totalRevenue,
      costs: totalCosts,
      cashOnHand: Math.round(45000 + quarter * 8000 + revenueVariance - costsVariance),
      insight: quarterInsights[quarter - 1],
      uncategorizedTransactions: Math.floor(Math.random() * 50) + 20,
      monthlyBreakdown,
      dailyBreakdown,
    }
  })
}

function generateYearlyData(): FinancialPeriod[] {
  return [2023, 2024, 2025].map((year, index) => {
    const is2025 = year === 2025
    // For 2025, use 11/12 of the base revenue (no December data)
    const yearFactor = is2025 ? 11 / 12 : 1
    const baseRevenue = (280000 + index * 35000) * yearFactor
    const baseCosts = (52000 + index * 5000) * yearFactor
    const revenueVariance = Math.floor((Math.random() - 0.3) * 40000) * yearFactor

    // Generate monthly breakdown for line chart
    // 2025 excludes December (no data yet)
    const dailyBreakdown = generateMonthlyChartData(
      7500 + index * 500,   // base monthly revenue increases each year
      1200 + index * 100,   // base monthly costs
      5000 + index * 300,   // base monthly cash
      is2025                // excludeDecember for 2025
    )

    return {
      id: `year-${year}`,
      periodLabel: `${year}`,
      periodType: 'year' as const,
      year,
      revenue: Math.round(baseRevenue + revenueVariance),
      costs: Math.round(baseCosts + revenueVariance * 0.15),
      cashOnHand: Math.round(120000 + index * 25000),
      insight: is2025
        ? 'Year to date - December data not yet available.'
        : `${year} closed with ${index === 0 ? 'foundational' : 'accelerated'} growth.`,
      uncategorizedTransactions: is2025 ? 14 : 0,
      dailyBreakdown,
    }
  })
}

/**
 * Calculate period-to-date comparison for current periods
 * Compares current period progress against same point in previous period
 */
function calculatePeriodToDateComparison(
  viewType: 'month' | 'quarter' | 'year',
  previousPeriodData: FinancialPeriod | null,
  currentDayOfPeriod: number,
  totalDaysInPreviousPeriod: number
): PeriodToDateComparison | undefined {
  if (!previousPeriodData) return undefined

  // Calculate what fraction of the previous period to compare against
  const fractionOfPeriod = Math.min(currentDayOfPeriod / totalDaysInPreviousPeriod, 1)

  // Estimate the previous period's values for the same number of days
  const previousPeriodToDateRevenue = Math.round(previousPeriodData.revenue * fractionOfPeriod)
  const previousPeriodToDateCosts = Math.round(previousPeriodData.costs * fractionOfPeriod)

  // Generate comparison label
  let comparisonLabel: string
  const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  if (viewType === 'month' && previousPeriodData.month !== undefined) {
    comparisonLabel = `${shortMonthNames[previousPeriodData.month]} 1-${currentDayOfPeriod}`
  } else if (viewType === 'quarter' && previousPeriodData.quarter) {
    comparisonLabel = `Q${previousPeriodData.quarter} days 1-${currentDayOfPeriod}`
  } else {
    comparisonLabel = `${previousPeriodData.year} days 1-${currentDayOfPeriod}`
  }

  return {
    previousPeriodToDateRevenue,
    previousPeriodToDateCosts,
    daysElapsed: currentDayOfPeriod,
    comparisonLabel,
  }
}

/**
 * Get the current day within the period based on simulated date (December 9, 2025)
 */
export function getCurrentDayOfPeriod(viewType: 'month' | 'quarter' | 'year'): number {
  const dayOfMonth = SIMULATED_DAY

  if (viewType === 'month') {
    return dayOfMonth
  } else if (viewType === 'quarter') {
    // Calculate day within quarter (Q4: Oct 1 - Dec 31)
    // Oct has 31 days, Nov has 30 days, Dec up to SIMULATED_DAY
    const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    const quarterStartMonth = Math.floor(SIMULATED_MONTH / 3) * 3 // 9 for Q4

    let dayOfQuarter = dayOfMonth
    for (let m = quarterStartMonth; m < SIMULATED_MONTH; m++) {
      dayOfQuarter += daysPerMonth[m]
    }
    return dayOfQuarter // Oct (31) + Nov (30) + Dec 9 = 70 days
  } else {
    // Calculate day within year
    const startOfYear = new Date(SIMULATED_YEAR, 0, 1)
    const diffTime = SIMULATED_DATE.getTime() - startOfYear.getTime()
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
  }
}

// Export all datasets
const rawMonthlyData = generateMonthlyData()
const rawQuarterlyData = generateQuarterlyData()
const rawYearlyData = generateYearlyData()

// Add period-to-date comparisons for current periods
function addPeriodToDateComparisons(): {
  monthly: FinancialPeriod[]
  quarterly: FinancialPeriod[]
  yearly: FinancialPeriod[]
} {
  // Use simulated date (December 9, 2025)
  const currentMonth = SIMULATED_MONTH
  const currentQuarter = Math.floor(currentMonth / 3)
  const currentYear = SIMULATED_YEAR
  const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  // Monthly: add comparison for current month
  const monthly = rawMonthlyData.map((period, index) => {
    if (period.month === currentMonth && period.year === currentYear && index > 0) {
      const previousMonth = rawMonthlyData[index - 1]
      const dayOfMonth = getCurrentDayOfPeriod('month')
      const daysInPreviousMonth = daysPerMonth[index - 1]

      return {
        ...period,
        periodToDateComparison: calculatePeriodToDateComparison(
          'month',
          previousMonth,
          dayOfMonth,
          daysInPreviousMonth
        ),
      }
    }
    return period
  })

  // Quarterly: add comparison for current quarter
  const quarterly = rawQuarterlyData.map((period, index) => {
    if (period.quarter === currentQuarter + 1 && period.year === currentYear && index > 0) {
      const previousQuarter = rawQuarterlyData[index - 1]
      const dayOfQuarter = getCurrentDayOfPeriod('quarter')
      // Previous quarter days (roughly 91)
      const quarterStartMonth = (index - 1) * 3
      const daysInPreviousQuarter = daysPerMonth[quarterStartMonth] +
        daysPerMonth[quarterStartMonth + 1] +
        daysPerMonth[quarterStartMonth + 2]

      return {
        ...period,
        periodToDateComparison: calculatePeriodToDateComparison(
          'quarter',
          previousQuarter,
          dayOfQuarter,
          daysInPreviousQuarter
        ),
      }
    }
    return period
  })

  // Yearly: add comparison for current year
  const yearly = rawYearlyData.map((period, index) => {
    if (period.year === currentYear && index > 0) {
      const previousYear = rawYearlyData[index - 1]
      const dayOfYear = getCurrentDayOfPeriod('year')

      return {
        ...period,
        periodToDateComparison: calculatePeriodToDateComparison(
          'year',
          previousYear,
          dayOfYear,
          365
        ),
      }
    }
    return period
  })

  return { monthly, quarterly, yearly }
}

const processedData = addPeriodToDateComparisons()
export const monthlyFinancialData = processedData.monthly
export const quarterlyFinancialData = processedData.quarterly
export const yearlyFinancialData = processedData.yearly

// Helper to get data by view type
export function getFinancialDataByView(view: 'month' | 'quarter' | 'year'): FinancialPeriod[] {
  switch (view) {
    case 'month':
      return monthlyFinancialData
    case 'quarter':
      return quarterlyFinancialData
    case 'year':
      return yearlyFinancialData
  }
}

// Format helpers
export function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `$${Math.round(amount / 1000)}K`
  }
  return `$${amount}`
}

export function formatFullCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
