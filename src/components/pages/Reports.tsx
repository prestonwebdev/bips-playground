/**
 * Reports - Dashboard-style reports page
 *
 * Features:
 * - Sticky header with "Reports" title and date navigation
 * - Main chart with tabs (Estimated Profit, Revenue, Costs)
 * - Three cards below: Assistant, Spending, Invoices
 */

import { useState, useCallback, useMemo, useEffect } from 'react'

/**
 * Calculate nice round tick values for Y-axis
 */
function getNiceTickValues(min: number, max: number, targetTickCount: number = 4): number[] {
  const range = max - min
  if (range === 0) return [0]

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
import {
  ChartContainer,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
  LabelList,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts'
import { ProfitBarChart as SharedProfitBarChart, CHART_COLORS } from '@/components/charts/ProfitBarChart'
import { AnimatedNumber } from '@/components/overview/AnimatedNumber'
import {
  getFinancialDataByView,
  type FinancialPeriod,
  SIMULATED_MONTH,
  SIMULATED_YEAR,
  SIMULATED_DAY,
  monthlyFinancialData,
  yearlyFinancialData,
} from '@/lib/quarterly-data'
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  CreditCard,
  Landmark,
  FileText,
  Copy,
  UtensilsCrossed,
  Megaphone,
  Monitor,
  Truck,
  FlaskConical,
  Headphones,
  TrendingUp,
  Users,
  Calculator,
  MessageCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import { AnimatedChevron } from '@/components/ui/animated-chevron'

// Month names
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/**
 * Chart config
 */
const chartConfig = {
  revenue: {
    label: 'Income',
    color: 'var(--color-primary-p-500)',
  },
  costs: {
    label: 'Costs',
    color: 'var(--color-primary-p-800)',
  },
  profit: {
    label: 'Profit',
    color: 'var(--color-primary-p-500)',
  },
}

/**
 * Spending categories data
 */
interface SpendingCategory {
  id: string
  name: string
  amount: number
  icon: LucideIcon
}

// Base spending category definitions (amounts will be generated dynamically)
const spendingCategoryDefs = [
  { id: 'food', name: 'Food', icon: UtensilsCrossed, baseAmount: 2800 },
  { id: 'marketing', name: 'Marketing', icon: Megaphone, baseAmount: 1900 },
  { id: 'software', name: 'Software', icon: Monitor, baseAmount: 950 },
  { id: 'logistics', name: 'Logistics', icon: Truck, baseAmount: 2100 },
  { id: 'research', name: 'Research', icon: FlaskConical, baseAmount: 1250 },
  { id: 'support', name: 'Customer Support', icon: Headphones, baseAmount: 680 },
  { id: 'sales', name: 'Sales', icon: TrendingUp, baseAmount: 1550 },
  { id: 'hr', name: 'Human Resources', icon: Users, baseAmount: 1020 },
  { id: 'finance', name: 'Finance', icon: Calculator, baseAmount: 450 },
]

/**
 * Income source data
 */
interface IncomeSource {
  id: string
  name: string
  amount: number
  icon: LucideIcon
}

// Base income source definitions
const incomeSourceDefs = [
  { id: 'stripe', name: 'Stripe Payments', icon: CreditCard, baseAmount: 12500 },
  { id: 'bank', name: 'Bank Deposits', icon: Landmark, baseAmount: 8200 },
  { id: 'invoices', name: 'Invoice Payments', icon: FileText, baseAmount: 5800 },
  { id: 'cash', name: 'Cash Deposits', icon: DollarSign, baseAmount: 2100 },
]

/**
 * Generate income sources based on period
 */
function generateIncomeSources(viewType: 'month' | 'year', periodIndex: number): IncomeSource[] {
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 9999) * 10000
    return x - Math.floor(x)
  }

  const multiplier = viewType === 'year' ? 12 : 1
  const isCurrentMonth = viewType === 'month' && periodIndex === SIMULATED_MONTH
  const partialFraction = isCurrentMonth ? SIMULATED_DAY / 31 : 1

  return incomeSourceDefs.map((src, idx) => {
    const variance = seededRandom(periodIndex * 200 + idx) * 0.3 - 0.15
    const amount = src.baseAmount * multiplier * partialFraction * (1 + variance)
    return {
      id: src.id,
      name: src.name,
      amount: Math.round(amount * 100) / 100,
      icon: src.icon,
    }
  })
}

/**
 * Generate spending categories based on period
 */
function generateSpendingCategories(viewType: 'month' | 'year', periodIndex: number): SpendingCategory[] {
  // Seeded random for consistent values
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 9999) * 10000
    return x - Math.floor(x)
  }

  // For year view, multiply by ~12 and add variance
  const multiplier = viewType === 'year' ? 12 : 1
  // For current month (December), scale by partial month progress
  const isCurrentMonth = viewType === 'month' && periodIndex === SIMULATED_MONTH
  const partialFraction = isCurrentMonth ? SIMULATED_DAY / 31 : 1

  return spendingCategoryDefs.map((cat, idx) => {
    const variance = seededRandom(periodIndex * 100 + idx) * 0.4 - 0.2 // -20% to +20%
    const amount = cat.baseAmount * multiplier * partialFraction * (1 + variance)
    return {
      id: cat.id,
      name: cat.name,
      amount: Math.round(amount * 100) / 100,
      icon: cat.icon,
    }
  })
}

/**
 * Account balances data
 */
interface AccountBalance {
  id: string
  name: string
  bankName: string
  accountNumber: string
  bankType: 'chase' | 'wellsfargo'
  amount: number
  color: string
}

/**
 * Generate account balances based on period
 */
function generateAccountBalances(viewType: 'month' | 'year', periodIndex: number): AccountBalance[] {
  // Base balances that grow over time
  const baseBalances = {
    checking: 10000,
    savings: 5000,
    creditDebt: 1500, // Credit card debt (negative)
  }

  // Growth per month
  const monthlyGrowth = {
    checking: 450,
    savings: 280,
    creditDebt: 50, // Debt grows slower
  }

  // Calculate months from start (Jan 2024 = 0)
  const monthsFromStart = viewType === 'year'
    ? (periodIndex + 1) * 12 // End of year
    : periodIndex + 1 // Month index + 1

  // Add some variance based on period
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 9999) * 10000
    return x - Math.floor(x)
  }

  const variance = seededRandom(periodIndex * 50) * 0.1 - 0.05 // -5% to +5%

  return [
    {
      id: 'checking',
      name: 'Business Checking',
      bankName: 'Chase',
      accountNumber: '1145',
      bankType: 'chase',
      amount: Math.round(baseBalances.checking + monthlyGrowth.checking * monthsFromStart * (1 + variance)),
      color: 'var(--color-primary-p-500)'
    },
    {
      id: 'savings',
      name: 'Business Savings',
      bankName: 'Chase',
      accountNumber: '2224',
      bankType: 'chase',
      amount: Math.round(baseBalances.savings + monthlyGrowth.savings * monthsFromStart * (1 + variance)),
      color: 'var(--color-primary-p-700)'
    },
    {
      id: 'credit',
      name: 'Credit Card',
      bankName: 'Wells Fargo',
      accountNumber: '4455',
      bankType: 'wellsfargo',
      amount: -Math.round(baseBalances.creditDebt + monthlyGrowth.creditDebt * monthsFromStart * (1 + variance)),
      color: '#ac4545' // Red for debt
    },
  ]
}

/**
 * Helper functions
 */
function getCurrentPeriodIndex(viewType: 'month' | 'year'): number {
  switch (viewType) {
    case 'month':
      return SIMULATED_MONTH
    case 'year':
      return SIMULATED_YEAR - 2023
  }
}

/**
 * Main Reports Component
 */
interface ReportsProps {
  initialTab?: string | null
  onInitialTabUsed?: () => void
}

export default function Reports({ initialTab, onInitialTabUsed }: ReportsProps = {}) {
  const [viewType, setViewType] = useState<'month' | 'year'>('month')
  const [currentIndex, setCurrentIndex] = useState(() => getCurrentPeriodIndex('month'))
  const [activeTab, setActiveTab] = useState<'profit' | 'revenue' | 'costs' | 'cash'>(() => {
    // Map initialTab from DashboardV4 to Reports tabs
    if (initialTab === 'profit') return 'profit'
    if (initialTab === 'revenue') return 'revenue'
    if (initialTab === 'costs') return 'costs'
    if (initialTab === 'cashOnHand') return 'cash'
    return 'profit'
  })

  // Handle initial tab navigation
  useEffect(() => {
    if (initialTab) {
      // Map and set the tab
      if (initialTab === 'profit') setActiveTab('profit')
      else if (initialTab === 'revenue') setActiveTab('revenue')
      else if (initialTab === 'costs') setActiveTab('costs')
      else if (initialTab === 'cashOnHand') setActiveTab('cash')

      // Mark initial tab as used
      onInitialTabUsed?.()
    }
  }, [initialTab, onInitialTabUsed])

  const data = getFinancialDataByView(viewType)
  const currentPeriod: FinancialPeriod = data[currentIndex] || data[0]

  // Generate account balances - for current period display
  const accountBalances = useMemo(() => {
    return generateAccountBalances(viewType, currentIndex)
  }, [viewType, currentIndex])

  // Calculate cash on hand value and "as of" label for past periods
  const cashOnHandData = useMemo(() => {
    const cashData = generateCashOnHandData(viewType, currentIndex)
    const validData = cashData.filter(d => d.total !== null)

    // For current period, get the last valid value (today's value)
    // For past periods, get the last value (end of period value)
    const isCurrentPeriod = viewType === 'month'
      ? currentIndex === SIMULATED_MONTH
      : currentIndex === (SIMULATED_YEAR - 2023)

    const value = validData.length > 0 ? validData[validData.length - 1].total : 0

    // Generate "at the end of" label for past periods
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    let asOfLabel: string | null = null
    if (!isCurrentPeriod) {
      if (viewType === 'month') {
        asOfLabel = `at the end of ${monthNames[currentIndex]}`
      } else {
        const year = 2023 + currentIndex
        asOfLabel = `at the end of ${year}`
      }
    }

    return { value, asOfLabel }
  }, [viewType, currentIndex])

  // Calculate total and comparison based on active tab
  const { currentTotal } = useMemo(() => {
    const profit = currentPeriod.revenue - currentPeriod.costs

    let total: number

    switch (activeTab) {
      case 'profit':
        total = profit
        break
      case 'revenue':
        total = currentPeriod.revenue
        break
      case 'costs':
        total = currentPeriod.costs
        break
      case 'cash':
        total = cashOnHandData.value ?? 0
        break
    }

    return {
      currentTotal: total,
    }
  }, [activeTab, currentPeriod, cashOnHandData])

  const handleViewChange = useCallback((newView: 'month' | 'year') => {
    setViewType(newView)
    setCurrentIndex(getCurrentPeriodIndex(newView))
  }, [])

  const handleNavigate = useCallback((dir: 'prev' | 'next') => {
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
    if (newIndex !== -1) {
      setCurrentIndex(newIndex)
    }
  }, [data])

  // Generate dynamic spending categories based on current period
  const spendingCategories = useMemo(() => {
    return generateSpendingCategories(viewType, currentIndex)
  }, [viewType, currentIndex])

  // Generate dynamic income sources based on current period
  const incomeSources = useMemo(() => {
    return generateIncomeSources(viewType, currentIndex)
  }, [viewType, currentIndex])

  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < data.length - 1

  return (
    <div className="flex flex-col h-full bg-white overflow-auto">
      {/* Fixed Header */}
      <div className="shrink-0 px-12 pt-7 pb-5 bg-white">
        <div className="flex items-center justify-between">
          {/* Left Side: Combined Period Selector */}
          <div className="flex items-center gap-4">
            {/* Combined pill with Month/Year toggle, divider, and date dropdown */}
            <div className="flex items-center gap-1 p-1 bg-white border border-[var(--color-neutral-g-100)] rounded-full shadow-[0px_2px_4px_0px_rgba(70,81,83,0.01),0px_7px_7px_0px_rgba(70,81,83,0.01)]">
              {/* Month/Year Toggle */}
              <div className="flex items-center">
                <button
                  onClick={() => handleViewChange('month')}
                  className={`px-3 py-[5px] rounded-full text-[15px] font-['Poppins'] tracking-[-0.3px] transition-colors ${
                    viewType === 'month'
                      ? 'bg-[var(--color-neutral-g-100)] text-[var(--color-primary-p-500)] font-semibold'
                      : 'text-[var(--color-neutral-n-700)]'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => handleViewChange('year')}
                  className={`px-3 py-1 rounded-full text-[15px] font-['Poppins'] tracking-[-0.3px] transition-colors ${
                    viewType === 'year'
                      ? 'bg-[var(--color-neutral-g-100)] text-[var(--color-primary-p-500)] font-semibold'
                      : 'text-[var(--color-neutral-n-700)]'
                  }`}
                >
                  Year
                </button>
              </div>

              {/* Vertical Divider */}
              <div className="w-px h-[35px] bg-[var(--color-neutral-g-100)]" />

              {/* Date Dropdown */}
              <PeriodDropdownV3 currentPeriod={currentPeriod} viewType={viewType} onPeriodSelect={handlePeriodSelect} />
            </div>

            {/* Navigation Arrows - separate circular buttons */}
            <div className="flex items-center gap-4">
              <NavigationButton direction="prev" onClick={() => handleNavigate('prev')} disabled={!hasPrev} />
              <NavigationButton direction="next" onClick={() => handleNavigate('next')} disabled={!hasNext} />
            </div>
          </div>

          {/* Right Side: Action buttons */}
          <div className="flex items-center gap-3">
            {/* Monthly Summary - only shows on month view */}
            {viewType === 'month' && (
              <button
                onClick={() => {
                  console.log('Monthly Summary clicked')
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-normal font-['Poppins'] tracking-[-0.26px] transition-colors shadow-sm bg-white border border-[var(--color-neutral-g-200)] text-[var(--color-neutral-n-700)] hover:bg-[var(--color-neutral-g-50)]"
              >
                <MessageCircle className="w-5 h-5" />
                Monthly Summary
              </button>
            )}

            {/* View P&L Report button */}
            <button className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-normal font-['Poppins'] tracking-[-0.26px] transition-colors shadow-sm bg-white border border-[var(--color-primary-p-500)] text-[var(--color-primary-p-500)] hover:bg-[var(--color-primary-p-50)]">
              <FileText className="w-5 h-5" />
              View P&L Report
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto px-12 py-6 pb-56 bg-white">
        <div className="max-w-[1800px] mx-auto">

      {/* Main Chart Section with Tabs - Two Column Layout */}
      <ResizablePanelGroup direction="horizontal" className="min-h-[600px]">
        {/* Left Column: Charts */}
        <ResizablePanel defaultSize={70} minSize={50}>
          <div className="pr-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'profit' | 'revenue' | 'costs')} className="w-full">
              {/* Tabs Row */}
              <div className="flex items-center justify-between mb-8">
                {/* Left: Tab buttons */}
                <TabsList className="bg-transparent p-0 h-auto gap-1">
                  <TabsTrigger
                    value="profit"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium font-['Poppins'] data-[state=active]:bg-[var(--color-neutral-g-100)] data-[state=active]:text-[var(--color-neutral-n-800)] data-[state=active]:shadow-none text-[var(--color-neutral-n-500)] hover:bg-[var(--color-neutral-g-50)]"
                  >
                    <Copy className="w-4 h-4" />
                    Profit & Loss
                  </TabsTrigger>
                  <TabsTrigger
                    value="revenue"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium font-['Poppins'] data-[state=active]:bg-[var(--color-neutral-g-100)] data-[state=active]:text-[var(--color-neutral-n-800)] data-[state=active]:shadow-none text-[var(--color-neutral-n-500)] hover:bg-[var(--color-neutral-g-50)]"
                  >
                    <DollarSign className="w-4 h-4" />
                    Income
                  </TabsTrigger>
                  <TabsTrigger
                    value="costs"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium font-['Poppins'] data-[state=active]:bg-[var(--color-neutral-g-100)] data-[state=active]:text-[var(--color-neutral-n-800)] data-[state=active]:shadow-none text-[var(--color-neutral-n-500)] hover:bg-[var(--color-neutral-g-50)]"
                  >
                    <CreditCard className="w-4 h-4" />
                    Costs
                  </TabsTrigger>
                  <TabsTrigger
                    value="cash"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium font-['Poppins'] data-[state=active]:bg-[var(--color-neutral-g-100)] data-[state=active]:text-[var(--color-neutral-n-800)] data-[state=active]:shadow-none text-[var(--color-neutral-n-500)] hover:bg-[var(--color-neutral-g-50)]"
                  >
                    <Landmark className="w-4 h-4" />
                    Cash On Hand
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Total Value Display */}
              <div className="mb-6">
                <div className="flex flex-col">
                  {activeTab === 'cash' && (
                    <span className="text-[14px] text-[var(--color-neutral-n-500)] font-['Poppins'] mb-1">
                      Cash On Hand
                    </span>
                  )}
                  <span className={`text-[48px] font-medium font-['Poppins'] tracking-[-0.96px] leading-[1.1] ${
                    activeTab === 'profit' && currentTotal < 0
                      ? 'text-red-500'
                      : activeTab === 'costs'
                        ? 'text-[#b68b69]'
                        : 'text-[var(--color-neutral-n-800)]'
                  }`}>
                    {activeTab === 'profit' && currentTotal < 0 ? '-' : ''}
                    <AnimatedNumber
                      value={Math.abs(currentTotal)}
                      format="full"
                      duration={0.25}
                    />
                  </span>
                  {/* Show "as of" label for cash on hand in past periods */}
                  {activeTab === 'cash' && cashOnHandData.asOfLabel && (
                    <p className="text-[14px] text-[var(--color-neutral-n-500)] font-['Poppins'] mt-1">
                      {cashOnHandData.asOfLabel}
                    </p>
                  )}
                </div>
              </div>

              {/* Chart Content */}
              <TabsContent value="profit" className="mt-0">
                <SharedProfitBarChart
                  viewType={viewType}
                  monthNumber={viewType === 'month' ? currentIndex : undefined}
                  isCurrentPeriod={viewType === 'month' ? currentIndex === SIMULATED_MONTH : currentIndex === (SIMULATED_YEAR - 2023)}
                  height="h-[480px]"
                />
              </TabsContent>
              <TabsContent value="revenue" className="mt-0">
                <IncomeBarChart viewType={viewType} currentIndex={currentIndex} height="h-[480px]" />
              </TabsContent>
              <TabsContent value="costs" className="mt-0">
                <CostsBarChart viewType={viewType} currentIndex={currentIndex} height="h-[480px]" />
              </TabsContent>
              <TabsContent value="cash" className="mt-0">
                <CashOnHandChart viewType={viewType} currentIndex={currentIndex} height="h-[480px]" />
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>

        {/* Resizable Handle */}
        <ResizableHandle
          withHandle
          className="bg-[var(--color-neutral-g-100)] hover:bg-[var(--color-neutral-g-200)] transition-colors data-[resize-handle-active]:bg-[var(--color-primary-p-100)]"
        />

        {/* Right Column: Context panel based on active tab */}
        <ResizablePanel defaultSize={30} minSize={20} maxSize={45}>
          <div className="pl-6 h-full">
            {activeTab === 'profit' && (
              <div>
                <h4 className="text-[16px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins'] mb-4">Profit Margin</h4>
                <ProfitBreakdown revenue={currentPeriod.revenue} costs={currentPeriod.costs} />
              </div>
            )}
            {activeTab === 'revenue' && (
              <div>
                <h4 className="text-[16px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins'] mb-4">Income Sources</h4>
                <BreakdownList items={incomeSources} type="revenue" />
              </div>
            )}
            {activeTab === 'costs' && (
              <div>
                <h4 className="text-[16px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins'] mb-4">Spending Categories</h4>
                <SpendingList categories={spendingCategories} />
              </div>
            )}
            {activeTab === 'cash' && (
              <div>
                <h4 className="text-[16px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins'] mb-4">Current Account Balances</h4>
                <AccountList accounts={accountBalances} />
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
        </div>
      </div>
    </div>
  )
}

/**
 * Spending List Component - Minimal row-based list matching BreakdownList design
 */
interface SpendingListProps {
  categories: SpendingCategory[]
}

function SpendingList({ categories }: SpendingListProps) {
  // Sort categories by amount (descending)
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => b.amount - a.amount)
  }, [categories])

  // Calculate total for percentage
  const totalAmount = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.amount, 0)
  }, [categories])

  return (
    <div className="flex flex-col max-w-[800px]">
      {sortedCategories.map((category, index) => {
        const percentOfTotal = (category.amount / totalAmount) * 100
        const Icon = category.icon

        return (
          <div
            key={category.id}
            className={`flex items-center gap-4 py-4 ${
              index < sortedCategories.length - 1 ? 'border-b border-[var(--color-neutral-g-100)]' : ''
            }`}
          >
            {/* Icon + Label */}
            <div className="flex items-center gap-3 w-[180px] flex-shrink-0">
              <Icon className="w-5 h-5 text-[var(--color-neutral-n-600)]" strokeWidth={1.5} />
              <span className="text-[15px] text-[var(--color-neutral-n-700)] font-['Poppins']">
                {category.name}
              </span>
            </div>

            {/* Progress bar */}
            <div className="flex-1 h-2 bg-[#e5e7e7] rounded-full overflow-hidden min-w-[100px]">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.max(percentOfTotal, 2)}%`,
                  backgroundColor: '#1a1a1a'
                }}
              />
            </div>

            {/* Amount */}
            <span className="text-[15px] font-medium text-[#1a1a1a] font-['Poppins'] w-28 text-right flex-shrink-0">
              ${category.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>

            {/* Percentage */}
            <span className="text-[15px] text-[#6b7280] font-['Poppins'] w-12 text-right flex-shrink-0">
              {Math.round(percentOfTotal)}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

/**
 * BreakdownList Component - Minimal row-based list for income sources
 */
interface BreakdownListProps {
  items: IncomeSource[]
  type: 'revenue' | 'costs'
}

function BreakdownList({ items }: BreakdownListProps) {
  // Sort items by amount (descending)
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => b.amount - a.amount)
  }, [items])

  // Calculate total for percentage
  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.amount, 0)
  }, [items])

  return (
    <div className="flex flex-col max-w-[800px]">
      {sortedItems.map((item, index) => {
        const percentOfTotal = (item.amount / totalAmount) * 100

        return (
          <div
            key={item.id}
            className={`flex items-center gap-4 py-4 ${
              index < sortedItems.length - 1 ? 'border-b border-[var(--color-neutral-g-100)]' : ''
            }`}
          >
            {/* Label */}
            <span className="text-[15px] text-[var(--color-neutral-n-700)] font-['Poppins'] w-[160px] flex-shrink-0">
              {item.name}
            </span>

            {/* Progress bar */}
            <div className="flex-1 h-2 bg-[#e5e7e7] rounded-full overflow-hidden min-w-[100px]">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.max(percentOfTotal, 2)}%`,
                  backgroundColor: '#1e3834'
                }}
              />
            </div>

            {/* Amount */}
            <span className="text-[15px] font-medium text-[#1a1a1a] font-['Poppins'] w-28 text-right flex-shrink-0">
              ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>

            {/* Percentage */}
            <span className="text-[15px] text-[#6b7280] font-['Poppins'] w-12 text-right flex-shrink-0">
              {Math.round(percentOfTotal)}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

/**
 * ProfitBreakdown Component - Shows revenue, costs, profit and margin
 */
interface ProfitBreakdownProps {
  revenue: number
  costs: number
}

function ProfitBreakdown({ revenue, costs }: ProfitBreakdownProps) {
  const profit = revenue - costs
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0
  const costsPercent = revenue > 0 ? Math.round((costs / revenue) * 100) : 0
  const isProfit = profit >= 0

  return (
    <div className="h-full">
      {/* Profit Margin Display */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-[36px] font-medium font-['Poppins'] tracking-[-0.72px] ${isProfit ? 'text-[var(--color-primary-p-500)]' : 'text-[var(--color-loss)]'}`}>
            {isProfit ? '' : '-'}{Math.abs(Math.round(profitMargin))}%
          </span>
          <span className="text-[14px] text-[var(--color-neutral-n-500)] font-['Poppins']">
            {isProfit ? 'profit margin' : 'loss margin'}
          </span>
        </div>
        <p className="text-[14px] text-[var(--color-neutral-n-600)] font-['Poppins'] tracking-[-0.28px]">
          {isProfit
            ? `For every $1 of revenue, you keep $${(profitMargin / 100).toFixed(2)} as profit.`
            : `For every $1 of revenue, you're losing $${(Math.abs(profitMargin) / 100).toFixed(2)}.`
          }
        </p>
      </div>

      {/* Breakdown */}
      <div className="flex flex-col gap-4">
        {/* Revenue */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-chart-revenue)' }} />
            <span className="text-[15px] text-[var(--color-neutral-n-700)] font-['Poppins'] tracking-[-0.3px]">
              Revenue
            </span>
          </div>
          <span className="text-[18px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins'] tracking-[-0.36px]">
            ${revenue.toLocaleString()}
          </span>
        </div>

        {/* Costs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-chart-costs)' }} />
            <span className="text-[15px] text-[var(--color-neutral-n-700)] font-['Poppins'] tracking-[-0.3px]">
              Costs ({costsPercent}%)
            </span>
          </div>
          <span className="text-[18px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins'] tracking-[-0.36px]">
            ${costs.toLocaleString()}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--color-neutral-g-100)]" />

        {/* Profit/Loss */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isProfit ? 'bg-[var(--color-primary-p-500)]' : 'bg-[var(--color-loss)]'}`} />
            <span className="text-[15px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins'] tracking-[-0.3px]">
              {isProfit ? 'Profit' : 'Loss'} ({Math.abs(Math.round(profitMargin))}%)
            </span>
          </div>
          <span className={`text-[18px] font-medium font-['Poppins'] tracking-[-0.36px] ${isProfit ? 'text-[var(--color-primary-p-500)]' : 'text-[var(--color-loss)]'}`}>
            {isProfit ? '' : '-'}${Math.abs(profit).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Account List Component - Shows account balances with progress bars
 */
interface AccountListProps {
  accounts: AccountBalance[]
}

function AccountList({ accounts }: AccountListProps) {
  // Separate cash accounts from debt accounts
  const cashAccounts = accounts.filter(acc => acc.amount >= 0)
  const debtAccounts = accounts.filter(acc => acc.amount < 0)

  // Calculate totals
  const totalCash = cashAccounts.reduce((sum, acc) => sum + acc.amount, 0)
  const totalDebt = Math.abs(debtAccounts.reduce((sum, acc) => sum + acc.amount, 0))
  const netCashOnHand = totalCash - totalDebt

  return (
    <div className="h-full">
      {/* Cash Section */}
      <div className="mb-4">
        <span className="text-[13px] text-[var(--color-neutral-n-500)] font-['Poppins'] tracking-[-0.26px] uppercase mb-2 block">
          Cash
        </span>
        <div className="flex flex-col gap-2">
          {cashAccounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[15px] text-[var(--color-neutral-n-700)] font-['Poppins'] tracking-[-0.3px]">
                  {account.name}
                </span>
                <span className="text-[12px] text-[var(--color-neutral-n-500)] font-['Poppins'] tracking-[-0.24px]">
                  {account.bankName} ***{account.accountNumber}
                </span>
              </div>
              <span className="text-[18px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins'] tracking-[-0.36px]">
                ${account.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--color-neutral-g-100)] my-4" />

      {/* Debts Section */}
      <div className="mb-4">
        <span className="text-[13px] text-[var(--color-neutral-n-500)] font-['Poppins'] tracking-[-0.26px] uppercase mb-2 block">
          Debts
        </span>
        <div className="flex flex-col gap-2">
          {debtAccounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[15px] text-[var(--color-neutral-n-700)] font-['Poppins'] tracking-[-0.3px]">
                  {account.name}
                </span>
                <span className="text-[12px] text-[var(--color-neutral-n-500)] font-['Poppins'] tracking-[-0.24px]">
                  {account.bankName} ***{account.accountNumber}
                </span>
              </div>
              <span className="text-[18px] font-medium text-[var(--color-loss)] font-['Poppins'] tracking-[-0.36px]">
                -${Math.abs(account.amount).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--color-neutral-g-100)] my-4" />

      {/* Net Total */}
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins'] tracking-[-0.28px]">
          Net Cash On Hand
        </span>
        <span className="text-[20px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins'] tracking-[-0.4px]">
          ${netCashOnHand.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

/**
 * Cash On Hand Chart Component - Just the line chart
 */
interface CashOnHandChartProps {
  viewType: 'month' | 'year'
  currentIndex: number
  height?: string
}

// Generate cash history data - daily for month view, monthly YTD for year view
function generateCashOnHandData(viewType: 'month' | 'year', periodIndex: number) {
  const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  // Base values (credit is debt, so it's subtracted from total)
  const baseChecking = 10000
  const baseSavings = 5000
  const baseCreditDebt = 1500

  const monthlyGrowth = { checking: 450, savings: 280, creditDebt: 50 }
  const dailyGrowth = { checking: 15, savings: 9, creditDebt: 2 }

  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 9999) * 10000
    return x - Math.floor(x)
  }

  if (viewType === 'month') {
    // For month view, show daily data for the entire month
    const targetMonth = periodIndex
    const numDays = daysInMonth[targetMonth] || 31
    const isCurrentMonth = targetMonth === SIMULATED_MONTH
    const currentDay = isCurrentMonth ? SIMULATED_DAY : numDays

    // Calculate base for start of this month
    const monthBaseChecking = baseChecking + monthlyGrowth.checking * targetMonth
    const monthBaseSavings = baseSavings + monthlyGrowth.savings * targetMonth
    const monthBaseCreditDebt = baseCreditDebt + monthlyGrowth.creditDebt * targetMonth

    const data = []
    for (let day = 1; day <= numDays; day++) {
      const isFuture = isCurrentMonth && day > currentDay
      const isToday = isCurrentMonth && day === currentDay

      if (isFuture) {
        // No data for future days - just include label for X axis
        data.push({
          label: `${day}`,
          total: null,
          checking: null,
          savings: null,
          creditDebt: null,
          isFuture: true,
          isToday: false,
        })
      } else {
        const variance = seededRandom(targetMonth * 100 + day) * 0.02 - 0.01
        const checking = Math.round((monthBaseChecking + dailyGrowth.checking * day) * (1 + variance))
        const savings = Math.round((monthBaseSavings + dailyGrowth.savings * day) * (1 + variance))
        const creditDebt = Math.round((monthBaseCreditDebt + dailyGrowth.creditDebt * day) * (1 + variance))
        // Total cash on hand = assets - debt
        const total = checking + savings - creditDebt

        data.push({
          label: `${day}`,
          total,
          checking,
          savings,
          creditDebt,
          isFuture: false,
          isToday,
        })
      }
    }
    return data
  } else {
    // For year view, show monthly data year to date
    const currentMonthInYear = SIMULATED_MONTH
    const monthsToShow = currentMonthInYear + 1 // Include current month

    return Array.from({ length: monthsToShow }, (_, idx) => {
      const variance = seededRandom(idx * 50) * 0.03 - 0.015
      const checking = Math.round((baseChecking + monthlyGrowth.checking * (idx + 1)) * (1 + variance))
      const savings = Math.round((baseSavings + monthlyGrowth.savings * (idx + 1)) * (1 + variance))
      const creditDebt = Math.round((baseCreditDebt + monthlyGrowth.creditDebt * (idx + 1)) * (1 + variance))

      return {
        label: shortMonthNames[idx],
        total: checking + savings - creditDebt,
        checking,
        savings,
        creditDebt,
        isFuture: false,
        isToday: false,
      }
    })
  }
}

function CashOnHandChart({ viewType, currentIndex, height = 'h-[350px]' }: CashOnHandChartProps) {
  const cashHistoryData = useMemo(() => generateCashOnHandData(viewType, currentIndex), [viewType, currentIndex])

  // Calculate max value for Y axis ticks (only from non-null values)
  const maxValue = useMemo(() => {
    const validTotals = cashHistoryData.filter(d => d.total !== null).map(d => d.total as number)
    return Math.max(...validTotals, 0)
  }, [cashHistoryData])

  // Find today indicator for month view
  const todayIndicator = useMemo(() => {
    if (viewType !== 'month') return null
    const todayIndex = cashHistoryData.findIndex((d) => d.isToday)
    if (todayIndex === -1) return null
    // Check if today is near the end of the chart (last 3 days)
    const isAtEnd = todayIndex >= cashHistoryData.length - 3
    return { label: cashHistoryData[todayIndex]?.label || '', isAtEnd }
  }, [cashHistoryData, viewType])

  const chartConfig = {
    total: {
      label: 'Total Cash',
      color: 'var(--color-neutral-n-800)',
    },
  }

  return (
    <ChartContainer config={chartConfig} className={`${height} w-full`}>
      <AreaChart
        data={cashHistoryData}
        margin={{ top: 30, right: 8, bottom: 30, left: 8 }}
      >
        <defs>
          <linearGradient id="cashGradientMain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-neutral-n-800)" stopOpacity={0.1} />
            <stop offset="100%" stopColor="var(--color-neutral-n-800)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={true}
          fontSize={11}
          fontFamily="Poppins"
          stroke="#8d9291"
        />
        <YAxis
          domain={[0, maxValue * 1.1]}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fontFamily: 'Poppins', fill: '#8d9291' }}
          tickFormatter={(value) => {
            if (Math.abs(value) < 10) return '0'
            const absValue = Math.abs(value)
            if (absValue >= 1000) {
              return `$${(absValue / 1000).toFixed(0)}K`
            }
            return `$${absValue.toFixed(0)}`
          }}
          ticks={getNiceTickValues(0, maxValue)}
          width={45}
        />
        <CartesianGrid
          horizontal={true}
          vertical={false}
          stroke="var(--color-neutral-g-100)"
        />

        {/* Today indicator line for month view */}
        {todayIndicator && (
          <ReferenceLine
            x={todayIndicator.label}
            stroke="#c1c5c5"
            strokeWidth={1}
            strokeDasharray="4 4"
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

        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null
            const data = payload[0].payload

            // Format date for tooltips
            const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            const formattedDate = viewType === 'month'
              ? `${shortMonthNames[currentIndex]} ${data.label}`
              : data.label

            // Show simplified tooltip for future days
            if (data.isFuture) {
              return (
                <div className="rounded-lg bg-white/90 backdrop-blur-[3px] border border-[var(--color-neutral-g-100)] px-3 py-2 shadow-[0px_5px_13px_0px_rgba(0,0,0,0.04),0px_20px_24px_0px_rgba(0,0,0,0.06)]">
                  <p className="text-[13px] text-[var(--color-neutral-n-600)] font-['Poppins']">
                    {formattedDate}
                  </p>
                  <span className="text-[13px] text-[var(--color-neutral-n-500)] font-['Poppins']">
                    No data yet
                  </span>
                </div>
              )
            }

            // Calculate assets (checking + savings) and debts
            const assets = (data.checking || 0) + (data.savings || 0)
            const debts = data.creditDebt || 0

            return (
              <div className="rounded-lg bg-white/90 backdrop-blur-[3px] border border-[var(--color-neutral-g-100)] px-3 py-2 shadow-[0px_5px_13px_0px_rgba(0,0,0,0.04),0px_20px_24px_0px_rgba(0,0,0,0.06)] min-w-[160px]">
                <p className="mb-2 text-sm font-medium text-[var(--color-neutral-n-800)]">
                  {formattedDate}
                </p>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[13px] text-[var(--color-neutral-n-600)]">Assets</span>
                    <span className="text-[13px] font-medium text-[var(--color-neutral-n-800)]">${assets.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[13px] text-[var(--color-neutral-n-600)]">Debts</span>
                    <span className="text-[13px] font-medium text-[#ac4545]">-${debts.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-[var(--color-neutral-g-100)] my-1" />
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[13px] font-medium text-[var(--color-neutral-n-800)]">Total</span>
                    <span className="text-[13px] font-medium text-[var(--color-primary-p-500)]">${data.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )
          }}
        />
        {/* Cash on hand line (solid) - connectNulls=false stops at today */}
        <Area
          type="monotone"
          dataKey="total"
          stroke="var(--color-neutral-n-800)"
          strokeWidth={2}
          fill="url(#cashGradientMain)"
          connectNulls={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}
/**
 * Income Area Chart
 */
interface ChartProps {
  viewType: 'month' | 'year'
  currentIndex: number
  height?: string
}

function IncomeBarChart({ viewType, currentIndex, height = 'h-[350px]' }: ChartProps) {
  const currentDay = SIMULATED_DAY
  const currentMonth = SIMULATED_MONTH

  const chartData = useMemo(() => {
    const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    if (viewType === 'month') {
      // For month view, show daily revenue
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      const targetMonth = currentIndex
      const monthDays = daysInMonth[targetMonth] || 31
      const monthName = shortMonthNames[targetMonth] || 'Dec'
      const isThisCurrentMonth = targetMonth === currentMonth

      const seed = targetMonth * 1000
      const seededRandom = (day: number) => {
        const x = Math.sin(seed + day) * 10000
        return x - Math.floor(x)
      }

      const days = []
      for (let day = 1; day <= monthDays; day++) {
        const isFuture = isThisCurrentMonth && day > currentDay
        const isToday = isThisCurrentMonth && day === currentDay
        const baseRevenue = isFuture ? 0 : 500 + Math.round(seededRandom(day * 2) * 1500)
        days.push({
          label: `${day}`,
          dateRange: `${monthName} ${day}`,
          revenue: baseRevenue,
          isFuture,
          isToday,
          isFirst: day === 1,
          isLast: day === monthDays,
          monthName,
        })
      }
      return days
    } else {
      // For year view, show monthly revenue
      return shortMonthNames.slice(0, SIMULATED_MONTH + 1).map((month, i) => {
        const monthData = monthlyFinancialData[i]
        return {
          label: month,
          dateRange: month,
          revenue: monthData?.revenue ?? Math.round(20000 + Math.random() * 10000),
          isFuture: false,
          isToday: false,
          isFirst: false,
          isLast: false,
        }
      })
    }
  }, [viewType, currentIndex, currentMonth, currentDay])

  // Calculate gap value (about 1px worth of the chart range) - only from non-future days
  const nonFutureData = chartData.filter(d => !d.isFuture)
  const maxValue = Math.max(...nonFutureData.map(d => d.revenue), 0)
  const gapValue = maxValue * 0.005 // 0.5% of max for minimal gap

  // Transform chart data - add gap by shifting values up from zero (except future days)
  const chartDataWithGap = chartData.map(d => ({
    ...d,
    displayRevenue: d.isFuture ? 0 : d.revenue + gapValue,
  }))

  // Find today indicator
  const todayIndicator = useMemo(() => {
    if (viewType !== 'month') return null
    const todayIndex = chartData.findIndex((d) => d.isToday)
    if (todayIndex === -1) return null
    // Check if today is near the end of the chart (last 3 days)
    const isAtEnd = todayIndex >= chartData.length - 3
    return { label: chartData[todayIndex]?.label || '', isAtEnd }
  }, [chartData, viewType])

  // Check if "This Month" indicator is at end for year view
  const thisMonthIsAtEnd = viewType === 'year' && SIMULATED_MONTH >= 10

  // Custom label renderer for bar values
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomLabel = (props: any) => {
    const { x = 0, y = 0, width = 0, index = 0 } = props
    const dataPoint = chartDataWithGap[index]
    if (!dataPoint || dataPoint.isFuture) return null

    // Use original revenue value for display (not the gap-adjusted displayRevenue)
    const value = dataPoint.revenue
    const formatted = value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : `$${value}`

    return (
      <text
        x={x + width / 2}
        y={y - 6}
        fill={CHART_COLORS.revenue}
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
    <ChartContainer config={chartConfig} className={`${height} w-full`}>
      <BarChart
        data={chartDataWithGap}
        margin={{ top: 30, right: 8, bottom: 30, left: 8 }}
        barCategoryGap={viewType === 'year' ? '20%' : '15%'}
      >
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={true}
          fontSize={11}
          fontFamily="Poppins"
          stroke="#8d9291"
        />
        <YAxis
          domain={[-gapValue, maxValue + gapValue * 2]}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fontFamily: 'Poppins', fill: '#8d9291' }}
          tickFormatter={(value) => {
            if (Math.abs(value) < 10) return '0'
            const absValue = Math.abs(value)
            if (absValue >= 1000) {
              return `$${(absValue / 1000).toFixed(0)}K`
            }
            return `$${absValue.toFixed(0)}`
          }}
          ticks={getNiceTickValues(0, maxValue)}
          width={45}
        />
        <CartesianGrid
          horizontal={true}
          vertical={false}
          stroke="var(--color-neutral-g-100)"
        />

        {/* Today indicator line for month view */}
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

        {/* This Month indicator line for year view */}
        {viewType === 'year' && (
          <ReferenceLine
            x={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][SIMULATED_MONTH]}
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

        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null
            const data = payload[0].payload
            if (data.isFuture) {
              return (
                <div className="rounded-lg bg-white/90 backdrop-blur-[3px] border border-[var(--color-neutral-g-100)] px-3 py-2 shadow-[0px_5px_13px_0px_rgba(0,0,0,0.04),0px_20px_24px_0px_rgba(0,0,0,0.06)]">
                  <p className="text-[13px] text-[var(--color-neutral-n-600)] font-['Poppins']">
                    {data.dateRange}
                  </p>
                  <span className="text-[13px] text-[var(--color-neutral-n-500)] font-['Poppins']">
                    No data yet
                  </span>
                </div>
              )
            }
            return (
              <div className="rounded-lg bg-white/90 backdrop-blur-[3px] border border-[var(--color-neutral-g-100)] px-3 py-2 shadow-[0px_5px_13px_0px_rgba(0,0,0,0.04),0px_20px_24px_0px_rgba(0,0,0,0.06)]">
                <p className="text-[15px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins'] mb-1">
                  {data.dateRange}
                </p>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS.revenue }} />
                    <span className="text-[14px] text-[var(--color-neutral-n-600)] font-['Poppins']">Income</span>
                  </div>
                  <span className="text-[14px] font-semibold text-[var(--color-neutral-n-800)] font-['Poppins']">
                    ${data.revenue?.toLocaleString()}
                  </span>
                </div>
              </div>
            )
          }}
        />
        <Bar dataKey="displayRevenue" radius={[4, 4, 4, 4]}>
          {chartDataWithGap.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.isFuture ? '#e5e7e7' : CHART_COLORS.revenue} />
          ))}
          <LabelList dataKey="displayRevenue" position="top" content={renderCustomLabel} />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

/**
 * Costs Bar Chart
 */
function CostsBarChart({ viewType, currentIndex, height = 'h-[350px]' }: ChartProps) {
  const currentDay = SIMULATED_DAY
  const currentMonth = SIMULATED_MONTH

  const chartData = useMemo(() => {
    const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    if (viewType === 'month') {
      // For month view, show daily costs
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      const targetMonth = currentIndex
      const monthDays = daysInMonth[targetMonth] || 31
      const monthName = shortMonthNames[targetMonth] || 'Dec'
      const isThisCurrentMonth = targetMonth === currentMonth

      const seed = targetMonth * 1000
      const seededRandom = (day: number) => {
        const x = Math.sin(seed + day) * 10000
        return x - Math.floor(x)
      }

      const days = []
      for (let day = 1; day <= monthDays; day++) {
        const isFuture = isThisCurrentMonth && day > currentDay
        const isToday = isThisCurrentMonth && day === currentDay
        const baseCosts = isFuture ? 0 : 100 + Math.round(seededRandom(day * 3) * 300)
        days.push({
          label: `${day}`,
          dateRange: `${monthName} ${day}`,
          costs: baseCosts,
          isFuture,
          isToday,
          isFirst: day === 1,
          isLast: day === monthDays,
          monthName,
        })
      }
      return days
    } else {
      // For year view, show monthly costs
      return shortMonthNames.slice(0, SIMULATED_MONTH + 1).map((month, i) => {
        const monthData = monthlyFinancialData[i]
        return {
          label: month,
          dateRange: month,
          costs: monthData?.costs ?? Math.round(4000 + Math.random() * 2000),
          isFuture: false,
          isToday: false,
          isFirst: false,
          isLast: false,
        }
      })
    }
  }, [viewType, currentIndex, currentMonth, currentDay])

  // Calculate gap value (about 1px worth of the chart range) - only from non-future days
  const nonFutureData = chartData.filter(d => !d.isFuture)
  const maxValue = Math.max(...nonFutureData.map(d => d.costs), 0)
  const gapValue = maxValue * 0.005 // 0.5% of max for minimal gap

  // Transform chart data - add gap by shifting values up from zero (except future days)
  const chartDataWithGap = chartData.map(d => ({
    ...d,
    displayCosts: d.isFuture ? 0 : d.costs + gapValue,
  }))

  // Find today indicator
  const todayIndicator = useMemo(() => {
    if (viewType !== 'month') return null
    const todayIndex = chartData.findIndex((d) => d.isToday)
    if (todayIndex === -1) return null
    // Check if today is near the end of the chart (last 3 days)
    const isAtEnd = todayIndex >= chartData.length - 3
    return { label: chartData[todayIndex]?.label || '', isAtEnd }
  }, [chartData, viewType])

  // Check if "This Month" indicator is at end for year view
  const thisMonthIsAtEnd = viewType === 'year' && SIMULATED_MONTH >= 10

  // Custom label renderer for bar values
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomLabel = (props: any) => {
    const { x = 0, y = 0, width = 0, index = 0 } = props
    const dataPoint = chartDataWithGap[index]
    if (!dataPoint || dataPoint.isFuture) return null

    // Use original costs value for display (not the gap-adjusted displayCosts)
    const value = dataPoint.costs
    const formatted = value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : `$${value}`

    return (
      <text
        x={x + width / 2}
        y={y - 6}
        fill={CHART_COLORS.costs}
        textAnchor="middle"
        fontSize={10}
        fontFamily="Poppins"
        fontWeight={500}
      >
        {formatted}
      </text>
    )
  }

  // Find "This Month" indicator for year view
  const thisMonthIndicator = useMemo(() => {
    if (viewType !== 'year') return null
    const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return { label: shortMonthNames[SIMULATED_MONTH] }
  }, [viewType])

  return (
    <ChartContainer config={chartConfig} className={`${height} w-full`}>
      <BarChart
        data={chartDataWithGap}
        margin={{ top: 30, right: 8, bottom: 30, left: 8 }}
        barCategoryGap={viewType === 'year' ? '20%' : '15%'}
      >
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={true}
          fontSize={11}
          fontFamily="Poppins"
          stroke="#8d9291"
        />
        <YAxis
          domain={[-gapValue, maxValue + gapValue * 2]}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fontFamily: 'Poppins', fill: '#8d9291' }}
          tickFormatter={(value) => {
            if (Math.abs(value) < 10) return '0'
            const absValue = Math.abs(value)
            if (absValue >= 1000) {
              return `$${(absValue / 1000).toFixed(0)}K`
            }
            return `$${absValue.toFixed(0)}`
          }}
          ticks={getNiceTickValues(0, maxValue)}
          width={45}
        />
        <CartesianGrid
          horizontal={true}
          vertical={false}
          stroke="var(--color-neutral-g-100)"
        />

        {/* Today indicator line for month view */}
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

        {/* This Month indicator line for year view */}
        {thisMonthIndicator && (
          <ReferenceLine
            x={thisMonthIndicator.label}
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

        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null
            const data = payload[0].payload
            if (data.isFuture) {
              return (
                <div className="rounded-lg bg-white/90 backdrop-blur-[3px] border border-[var(--color-neutral-g-100)] px-3 py-2 shadow-[0px_5px_13px_0px_rgba(0,0,0,0.04),0px_20px_24px_0px_rgba(0,0,0,0.06)]">
                  <p className="text-[13px] text-[var(--color-neutral-n-600)] font-['Poppins']">
                    {data.dateRange}
                  </p>
                  <span className="text-[13px] text-[var(--color-neutral-n-500)] font-['Poppins']">
                    No data yet
                  </span>
                </div>
              )
            }
            return (
              <div className="rounded-lg bg-white/90 backdrop-blur-[3px] border border-[var(--color-neutral-g-100)] px-3 py-2 shadow-[0px_5px_13px_0px_rgba(0,0,0,0.04),0px_20px_24px_0px_rgba(0,0,0,0.06)]">
                <p className="text-[15px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins'] mb-1">
                  {data.dateRange}
                </p>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS.costs }} />
                    <span className="text-[14px] text-[var(--color-neutral-n-600)] font-['Poppins']">Costs</span>
                  </div>
                  <span className="text-[14px] font-semibold text-[var(--color-neutral-n-800)] font-['Poppins']">
                    ${data.costs?.toLocaleString()}
                  </span>
                </div>
              </div>
            )
          }}
        />
        <Bar dataKey="displayCosts" radius={[4, 4, 4, 4]}>
          {chartDataWithGap.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.isFuture ? '#e5e7e7' : CHART_COLORS.costs} />
          ))}
          <LabelList dataKey="displayCosts" position="top" content={renderCustomLabel} />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

/**
 * Period Dropdown V3 Style - Inline dropdown matching V3's design
 */
function PeriodDropdownV3({
  currentPeriod,
  viewType,
  onPeriodSelect,
}: {
  currentPeriod: FinancialPeriod
  viewType: 'month' | 'year'
  onPeriodSelect?: (periodId: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const periodLabel = viewType === 'month'
    ? `${MONTH_NAMES[currentPeriod.month ?? 0]} ${currentPeriod.year}`
    : `${currentPeriod.year}`

  // Options ordered most recent first
  const options = viewType === 'month'
    ? MONTH_NAMES.slice(0, SIMULATED_MONTH + 1).map((month, idx) => ({
        label: `${month} ${SIMULATED_YEAR}`,
        idx,
        id: monthlyFinancialData[idx]?.id || `month-${idx}`,
      })).reverse()
    : [2023, 2024, 2025].map((year, idx) => ({
        label: `${year}`,
        idx,
        id: yearlyFinancialData[idx]?.id || `year-${idx}`,
      })).reverse()

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-between px-3 py-1 text-[17px] font-normal text-[var(--color-neutral-n-800)] font-['Poppins'] tracking-[-0.34px] hover:opacity-80 transition-opacity whitespace-nowrap w-[185px]">
          <span>{periodLabel}</span>
          <AnimatedChevron isOpen={isOpen} size={20} className="flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="max-h-[300px] overflow-auto">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.idx}
            onClick={() => {
              onPeriodSelect?.(option.id)
              setIsOpen(false)
            }}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Navigation Button Component
 */
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
        w-[38px] h-[38px] rounded-full border border-[var(--color-neutral-g-200)] bg-white
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
