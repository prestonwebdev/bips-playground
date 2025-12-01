/**
 * Quarterly Financial Data
 *
 * Mock data for the stacking cards dashboard view.
 * Each card represents a financial period (month/quarter/year).
 */

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

// Helper to generate weekly data points for a quarter
function generateWeeklyData(
  startMonth: number,
  baseRevenue: number,
  baseCosts: number,
  baseCash: number
): DailyDataPoint[] {
  const dataPoints: DailyDataPoint[] = []
  const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  // Generate ~13 weeks of data for a quarter
  let weekNum = 1
  for (let m = 0; m < 3; m++) {
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
function generateMonthlyChartData(
  baseRevenue: number,
  baseCosts: number,
  baseCash: number
): DailyDataPoint[] {
  const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return shortMonthNames.map((month, index) => {
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

    // Add realistic variance
    const revenueVariance = Math.floor((Math.random() - 0.3) * 8000)
    const costsVariance = Math.floor((Math.random() - 0.4) * 1500)

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
    'Q4 projections indicate strong finish to fiscal year.',
  ]

  const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return [1, 2, 3, 4].map((quarter) => {
    const baseRevenue = 72000 + (quarter - 1) * 5000
    const baseCosts = 13500 + (quarter - 1) * 800
    const revenueVariance = Math.floor((Math.random() - 0.3) * 15000)
    const costsVariance = Math.floor((Math.random() - 0.4) * 3000)

    // Generate monthly breakdown for this quarter
    const startMonth = (quarter - 1) * 3
    const monthlyBreakdown: MonthlyBreakdown[] = [0, 1, 2].map((offset) => {
      const monthIndex = startMonth + offset
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

    // Generate weekly breakdown for line chart
    const dailyBreakdown = generateWeeklyData(
      startMonth,
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
    const baseRevenue = 280000 + index * 35000
    const baseCosts = 52000 + index * 5000
    const revenueVariance = Math.floor((Math.random() - 0.3) * 40000)

    // Generate monthly breakdown for line chart
    const dailyBreakdown = generateMonthlyChartData(
      7500 + index * 500,   // base monthly revenue increases each year
      1200 + index * 100,   // base monthly costs
      5000 + index * 300    // base monthly cash
    )

    return {
      id: `year-${year}`,
      periodLabel: `${year}`,
      periodType: 'year' as const,
      year,
      revenue: Math.round(baseRevenue + revenueVariance),
      costs: Math.round(baseCosts + revenueVariance * 0.15),
      cashOnHand: Math.round(120000 + index * 25000),
      insight: year === 2025
        ? 'Current year on track to exceed previous performance.'
        : `${year} closed with ${index === 0 ? 'foundational' : 'accelerated'} growth.`,
      uncategorizedTransactions: year === 2025 ? 14 : 0,
      dailyBreakdown,
    }
  })
}

// Export all datasets
export const monthlyFinancialData = generateMonthlyData()
export const quarterlyFinancialData = generateQuarterlyData()
export const yearlyFinancialData = generateYearlyData()

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
