/**
 * Mock Financial Data Service
 *
 * This module provides realistic financial data for the dashboard.
 * Structure mimics what would come from Plaid or a similar banking API.
 */

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  category: string
  type: 'income' | 'expense'
}

export interface DailyMetrics {
  date: string
  revenue: number
  costs: number
  cash: number
}

export interface SpendingCategory {
  category: string
  amount: number
  percentage: number
  color: string
}

export interface FinancialSummary {
  revenue: number
  costs: number
  cashOnHand: number
  uncategorizedTransactions: number
}

// Muted color palette for spending categories (from Figma design)
export const SPENDING_COLORS = {
  equipment: '#2D7A4B',    // Green
  payroll: '#2D7A4B',      // Green (same as equipment in design)
  marketing: '#3B6B8C',    // Muted blue
  utilities: '#8B7CB6',    // Muted purple
  rent: '#C4847C',         // Muted coral
  supplies: '#B8956E',     // Muted tan
  insurance: '#8CA86B',    // Muted olive
  other: '#C7897A',        // Muted salmon
} as const

// Generate daily metrics for a month
function generateDailyMetrics(year: number, month: number): DailyMetrics[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const data: DailyMetrics[] = []

  // Base values with realistic variance
  let runningCash = 52000 // Starting cash

  for (let day = 1; day <= daysInMonth; day++) {
    // Revenue varies by day of week (weekends lower)
    const dayOfWeek = new Date(year, month, day).getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    const baseRevenue = isWeekend ? 600 : 1200
    const revenue = baseRevenue + Math.floor(Math.random() * 800) - 200

    // Costs are more consistent but have some variance
    const baseCosts = 400
    const costs = baseCosts + Math.floor(Math.random() * 300)

    // Cash accumulates
    runningCash = runningCash + revenue - costs

    data.push({
      date: `${month + 1}/${day}`,
      revenue,
      costs,
      cash: runningCash,
    })
  }

  return data
}

// Aggregate daily data to weekly for chart display
export function aggregateToWeekly(dailyData: DailyMetrics[]): DailyMetrics[] {
  const weeklyData: DailyMetrics[] = []

  for (let i = 0; i < dailyData.length; i += 5) {
    const week = dailyData.slice(i, i + 5)
    if (week.length === 0) continue

    const aggregated: DailyMetrics = {
      date: week[0].date,
      revenue: week.reduce((sum, d) => sum + d.revenue, 0),
      costs: week.reduce((sum, d) => sum + d.costs, 0),
      cash: week[week.length - 1].cash, // End of week cash
    }
    weeklyData.push(aggregated)
  }

  return weeklyData
}

// Generate spending by category
function generateSpendingData(): SpendingCategory[] {
  const categories = [
    { category: 'Equipment', baseAmount: 4800, color: SPENDING_COLORS.equipment },
    { category: 'Payroll', baseAmount: 4200, color: SPENDING_COLORS.payroll },
    { category: 'Marketing', baseAmount: 2800, color: SPENDING_COLORS.marketing },
    { category: 'Utilities', baseAmount: 1200, color: SPENDING_COLORS.utilities },
    { category: 'Rent', baseAmount: 3500, color: SPENDING_COLORS.rent },
    { category: 'Supplies', baseAmount: 950, color: SPENDING_COLORS.supplies },
    { category: 'Insurance', baseAmount: 800, color: SPENDING_COLORS.insurance },
    { category: 'Other', baseAmount: 650, color: SPENDING_COLORS.other },
  ]

  // Add variance to amounts
  const spending = categories.map(cat => ({
    ...cat,
    amount: cat.baseAmount + Math.floor(Math.random() * 500) - 250,
  }))

  // Calculate total and percentages
  const total = spending.reduce((sum, cat) => sum + cat.amount, 0)

  return spending
    .map(cat => ({
      category: cat.category,
      amount: cat.amount,
      percentage: Math.round((cat.amount / total) * 100),
      color: cat.color,
    }))
    .sort((a, b) => b.amount - a.amount) // Sort by amount descending
}

// Main data export for August 2025
const dailyMetrics = generateDailyMetrics(2025, 7) // August is month 7 (0-indexed)
const spendingData = generateSpendingData()

// Calculate summary metrics
const totalRevenue = dailyMetrics.reduce((sum, d) => sum + d.revenue, 0)
const totalCosts = dailyMetrics.reduce((sum, d) => sum + d.costs, 0)
const currentCash = dailyMetrics[dailyMetrics.length - 1]?.cash ?? 0

export const mockFinancialData = {
  // Summary metrics for the cards
  summary: {
    revenue: totalRevenue,
    costs: totalCosts,
    cashOnHand: currentCash,
    uncategorizedTransactions: 14,
  } as FinancialSummary,

  // Chart data (aggregated weekly for cleaner display)
  performanceData: aggregateToWeekly(dailyMetrics),

  // Daily data if needed
  dailyData: dailyMetrics,

  // Spending breakdown
  spendingData,

  // Current period
  currentPeriod: {
    label: 'August 2025',
    month: 7,
    year: 2025,
  },
}

// Utility to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Utility to format currency with decimals
export function formatCurrencyDecimal(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
