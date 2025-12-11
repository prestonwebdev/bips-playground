/**
 * Reports - Dashboard-style reports page
 *
 * Features:
 * - Sticky header with "Reports" title and date navigation
 * - Main chart with tabs (Estimated Profit, Revenue, Costs)
 * - Three cards below: Assistant, Spending, Invoices
 */

import { useState, useCallback, useMemo } from 'react'
import {
  ChartContainer,
} from '@/components/ui/chart'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  ReferenceLine,
  LabelList,
} from 'recharts'
import { AnimatedNumber } from '@/components/overview/AnimatedNumber'
import {
  getFinancialDataByView,
  type FinancialPeriod,
  SIMULATED_MONTH,
  SIMULATED_DAY,
  SIMULATED_YEAR,
  monthlyFinancialData,
  yearlyFinancialData,
} from '@/lib/quarterly-data'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  DollarSign,
  Wallet,
  CreditCard,
  Landmark,
} from 'lucide-react'
import { motion, LayoutGroup } from 'motion/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card } from '@/components/ui/card'

/**
 * Chart config
 */
const chartConfig = {
  revenue: {
    label: 'Revenue',
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
 * Chart Colors
 */
const CHART_COLORS = {
  revenue: '#2a4a47',
  costs: '#b68b69',
  profit: '#467c75',
  loss: '#b68b69',
} as const

/**
 * Spending categories data
 */
interface SpendingCategory {
  id: string
  name: string
  amount: number
  color: string
}

const spendingCategories: SpendingCategory[] = [
  { id: 'office', name: 'Office Supplies', amount: 724.38, color: '#dc2626' },
  { id: 'other', name: 'Other', amount: 624.38, color: '#1a1a1a' },
  { id: 'internet', name: 'Internet And Telephone', amount: 524.38, color: '#f97316' },
  { id: 'activity', name: 'Activity', amount: 324.38, color: '#eab308' },
  { id: 'meals', name: 'Meals', amount: 224.38, color: '#06b6d4' },
]

/**
 * Account balances data
 */
interface AccountBalance {
  id: string
  name: string
  amount: number
  color: string
}

const accountBalances: AccountBalance[] = [
  { id: 'checking', name: 'Business Checking', amount: 15420, color: 'var(--color-primary-p-500)' },
  { id: 'savings', name: 'Business Savings', amount: 8500, color: 'var(--color-primary-p-700)' },
  { id: 'credit', name: 'Credit Line', amount: 2900, color: 'var(--color-primary-p-300)' },
]

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
export default function Reports() {
  const [viewType, setViewType] = useState<'month' | 'year'>('month')
  const [currentIndex, setCurrentIndex] = useState(() => getCurrentPeriodIndex('month'))
  const [activeTab, setActiveTab] = useState<'profit' | 'revenue' | 'costs'>('revenue')

  const data = getFinancialDataByView(viewType)
  const currentPeriod: FinancialPeriod = data[currentIndex] || data[0]

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

  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < data.length - 1

  const profit = currentPeriod.revenue - currentPeriod.costs

  // Tab data
  const tabs = [
    { id: 'profit' as const, label: 'Estimated Profit', value: profit, icon: CreditCard },
    { id: 'revenue' as const, label: 'Revenue', value: currentPeriod.revenue, icon: DollarSign },
    { id: 'costs' as const, label: 'Costs', value: currentPeriod.costs, icon: CreditCard },
  ]

  return (
    <div className="w-full max-w-[1800px] mx-auto">
      {/* Sticky Header Row */}
      <div className="sticky top-0 z-20 bg-[var(--color-neutral-g-50)]/95 backdrop-blur-sm -mx-12 px-12 py-4 mb-6">
        <div className="flex items-center justify-between">
          {/* Title */}
          <h1 className="text-[26px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins'] leading-[40px] tracking-[-0.52px]">
            Reports
          </h1>

          {/* Right Side: Navigation + Period + Toggle */}
          <div className="flex items-center gap-6">
            {/* Navigation Arrows + Period Label */}
            <div className="flex items-center gap-4">
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
              <span className="text-[22px] font-medium text-[var(--color-neutral-n-700)] font-['Poppins'] leading-[36px] tracking-[-0.44px]">
                {currentPeriod.periodLabel}
              </span>
            </div>

            {/* View Selector */}
            <ViewSelector
              currentView={viewType}
              currentPeriod={currentPeriod}
              onViewChange={handleViewChange}
              onPeriodSelect={handlePeriodSelect}
            />
          </div>
        </div>
      </div>

      {/* Main Chart Card with Tabs */}
      <Card className="bg-white rounded-[16px] border-[var(--color-neutral-g-100)] p-6 mb-6">
        {/* Tabs */}
        <div className="flex items-center gap-8 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 pb-3 border-b-2 transition-colors ${
                  isActive
                    ? 'border-[var(--color-neutral-n-800)]'
                    : 'border-transparent hover:border-[var(--color-neutral-g-200)]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--color-neutral-n-800)]' : 'text-[var(--color-neutral-n-500)]'}`} />
                <span className={`text-[14px] font-['Poppins'] ${isActive ? 'text-[var(--color-neutral-n-800)]' : 'text-[var(--color-neutral-n-500)]'}`}>
                  {tab.label}
                </span>
                <span className={`text-[28px] font-medium font-['Poppins'] tracking-[-0.56px] ${
                  isActive ? 'text-[var(--color-neutral-n-800)]' : 'text-[var(--color-neutral-n-400)]'
                }`}>
                  ${tab.value.toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--color-neutral-n-800)]" />
            <span className="text-[13px] text-[var(--color-neutral-n-600)] font-['Poppins']">Current Period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--color-neutral-g-300)]" />
            <span className="text-[13px] text-[var(--color-neutral-n-600)] font-['Poppins']">Last Period</span>
          </div>
        </div>

        {/* Chart */}
        {activeTab === 'profit' ? (
          <ProfitBarChart viewType={viewType} currentIndex={currentIndex} />
        ) : activeTab === 'revenue' ? (
          <RevenueAreaChart viewType={viewType} currentIndex={currentIndex} />
        ) : (
          <CostsAreaChart viewType={viewType} currentIndex={currentIndex} />
        )}

        {/* Navigation arrows */}
        <div className="flex items-center justify-end gap-2 mt-4">
          <button className="w-8 h-8 rounded-full border border-[var(--color-neutral-g-200)] flex items-center justify-center hover:bg-[var(--color-neutral-g-50)] transition-colors">
            <ChevronLeft className="w-4 h-4 text-[var(--color-neutral-n-600)]" />
          </button>
          <button className="w-8 h-8 rounded-full border border-[var(--color-neutral-g-200)] flex items-center justify-center hover:bg-[var(--color-neutral-g-50)] transition-colors">
            <ChevronRight className="w-4 h-4 text-[var(--color-neutral-n-600)]" />
          </button>
        </div>
      </Card>

      {/* Two Cards Row - Expenses and Account Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Expenses Card */}
        <Card className="bg-white rounded-[16px] border-[var(--color-neutral-g-100)] p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-[#b68b69]" />
              <h3 className="text-[18px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins']">
                Expenses
              </h3>
            </div>
            <button className="flex items-center gap-1 text-[13px] text-[var(--color-neutral-n-600)] font-['Poppins'] hover:text-[var(--color-neutral-n-800)] transition-colors">
              Last 30 days
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <SpendingList categories={spendingCategories} />
        </Card>

        {/* Account Balance Card */}
        <Card className="bg-white rounded-[16px] border-[var(--color-neutral-g-100)] p-5">
          <div className="flex items-center gap-3 mb-6">
            <Landmark className="w-5 h-5 text-[var(--color-primary-p-500)]" />
            <h3 className="text-[18px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins']">
              Cash on Hand
            </h3>
          </div>
          <AccountBalanceChart accounts={accountBalances} />
        </Card>
      </div>
    </div>
  )
}

/**
 * Spending List Component
 */
interface SpendingListProps {
  categories: SpendingCategory[]
}

function SpendingList({ categories }: SpendingListProps) {
  const maxAmount = Math.max(...categories.map(c => c.amount))

  return (
    <div className="flex flex-col gap-3">
      {categories.map((category) => {
        const percentage = (category.amount / maxAmount) * 100

        return (
          <div key={category.id} className="flex items-center gap-3">
            {/* Color indicator */}
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: category.color }}
            />

            {/* Category Name */}
            <span className="text-[14px] text-[var(--color-neutral-n-700)] font-['Poppins'] w-[140px] flex-shrink-0">
              {category.name}
            </span>

            {/* Progress Bar */}
            <div className="flex-1 h-[8px] bg-[var(--color-neutral-g-100)] rounded overflow-hidden">
              <div
                className="h-full rounded transition-all duration-300"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: category.color,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Account Balance Chart Component - Stacked horizontal bar with legend
 */
interface AccountBalanceChartProps {
  accounts: AccountBalance[]
}

function AccountBalanceChart({ accounts }: AccountBalanceChartProps) {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.amount, 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Total Value */}
      <div className="mb-2">
        <span className="text-[28px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins'] tracking-[-0.56px]">
          ${totalBalance.toLocaleString()}
        </span>
      </div>

      {/* Stacked Bar */}
      <div className="flex h-[24px] w-full rounded-full overflow-hidden bg-[var(--color-neutral-g-100)]">
        {accounts.map((account) => {
          const percentage = (account.amount / totalBalance) * 100
          return (
            <div
              key={account.id}
              className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${percentage}%`,
                backgroundColor: account.color,
              }}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 mt-2">
        {accounts.map((account) => (
          <div key={account.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: account.color }}
              />
              <span className="text-[14px] text-[var(--color-neutral-n-700)] font-['Poppins']">
                {account.name}
              </span>
            </div>
            <span className="text-[14px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins']">
              ${account.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Revenue Area Chart
 */
interface ChartProps {
  viewType: 'month' | 'year'
  currentIndex: number
}

function RevenueAreaChart({ viewType, currentIndex }: ChartProps) {
  const chartData = useMemo(() => {
    if (viewType === 'month') {
      const period = monthlyFinancialData[currentIndex]
      if (period?.dailyBreakdown) {
        const sampled = period.dailyBreakdown.filter((_, i) => i % 5 === 0 || i === period.dailyBreakdown!.length - 1)
        return sampled.map(d => ({
          label: `8/${d.date.split('/')[1]}`,
          value: d.revenue,
          lastPeriod: d.revenue * 0.85,
          fullDate: `August ${d.date.split('/')[1]}`,
        }))
      }
      return [
        { label: '8/1', value: 15000, lastPeriod: 12000, fullDate: 'August 1' },
        { label: '8/5', value: 18000, lastPeriod: 15000, fullDate: 'August 5' },
        { label: '8/10', value: 22000, lastPeriod: 18000, fullDate: 'August 10' },
        { label: '8/15', value: 26000, lastPeriod: 20000, fullDate: 'August 15' },
        { label: '8/20', value: 24000, lastPeriod: 22000, fullDate: 'August 20' },
        { label: '8/25', value: 28000, lastPeriod: 24000, fullDate: 'August 25' },
        { label: '8/31', value: 26820, lastPeriod: 25000, fullDate: 'August 31' },
      ]
    } else {
      const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return shortMonths.slice(0, SIMULATED_MONTH + 1).map((month, i) => {
        const monthData = monthlyFinancialData[i]
        return {
          label: month,
          value: monthData?.revenue ?? Math.round(20000 + Math.random() * 10000),
          lastPeriod: (monthData?.revenue ?? 20000) * 0.85,
          fullDate: month,
        }
      })
    }
  }, [viewType, currentIndex])

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <AreaChart data={chartData} margin={{ top: 20, right: 20, bottom: 30, left: 50 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="lastPeriodGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#d1d5db" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#d1d5db" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          fontSize={14}
          fontFamily="Poppins"
          fontWeight={500}
          stroke="#8d9291"
          dy={10}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={14}
          fontFamily="Poppins"
          fontWeight={500}
          stroke="#8d9291"
          tickFormatter={(value) => `${Math.round(value / 1000)}K`}
          domain={[0, 'auto']}
          width={45}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null
            const data = payload[0].payload
            return (
              <div className="rounded-lg bg-[#161a1a] px-3 py-2 shadow-xl">
                <p className="text-[13px] text-[var(--color-neutral-g-400)] font-['Poppins'] leading-5">
                  {data.fullDate}
                </p>
                <p className="text-[16px] font-medium text-white font-['Poppins'] leading-7">
                  ${payload[0].value?.toLocaleString()}
                </p>
              </div>
            )
          }}
        />
        <Area
          type="monotone"
          dataKey="lastPeriod"
          stroke="#d1d5db"
          strokeWidth={2}
          fill="url(#lastPeriodGradient)"
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#1a1a1a"
          strokeWidth={2}
          fill="url(#revenueGradient)"
        />
      </AreaChart>
    </ChartContainer>
  )
}

/**
 * Costs Area Chart
 */
function CostsAreaChart({ viewType, currentIndex }: ChartProps) {
  const chartData = useMemo(() => {
    if (viewType === 'month') {
      const period = monthlyFinancialData[currentIndex]
      if (period?.dailyBreakdown) {
        const sampled = period.dailyBreakdown.filter((_, i) => i % 5 === 0 || i === period.dailyBreakdown!.length - 1)
        return sampled.map(d => ({
          label: `8/${d.date.split('/')[1]}`,
          value: d.costs,
          lastPeriod: d.costs * 1.1,
          fullDate: `August ${d.date.split('/')[1]}`,
        }))
      }
      return [
        { label: '8/1', value: 2000, lastPeriod: 2200, fullDate: 'August 1' },
        { label: '8/5', value: 3500, lastPeriod: 3800, fullDate: 'August 5' },
        { label: '8/10', value: 4200, lastPeriod: 4600, fullDate: 'August 10' },
        { label: '8/15', value: 6000, lastPeriod: 6500, fullDate: 'August 15' },
        { label: '8/20', value: 5500, lastPeriod: 6000, fullDate: 'August 20' },
        { label: '8/25', value: 7000, lastPeriod: 7500, fullDate: 'August 25' },
        { label: '8/31', value: 6500, lastPeriod: 7000, fullDate: 'August 31' },
      ]
    } else {
      const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return shortMonths.slice(0, SIMULATED_MONTH + 1).map((month, i) => {
        const monthData = monthlyFinancialData[i]
        return {
          label: month,
          value: monthData?.costs ?? Math.round(4000 + Math.random() * 2000),
          lastPeriod: (monthData?.costs ?? 4000) * 1.1,
          fullDate: month,
        }
      })
    }
  }, [viewType, currentIndex])

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <AreaChart data={chartData} margin={{ top: 20, right: 20, bottom: 30, left: 50 }}>
        <defs>
          <linearGradient id="costsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#b68b69" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#b68b69" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          fontSize={14}
          fontFamily="Poppins"
          fontWeight={500}
          stroke="#8d9291"
          dy={10}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={14}
          fontFamily="Poppins"
          fontWeight={500}
          stroke="#8d9291"
          tickFormatter={(value) => `${Math.round(value / 1000)}K`}
          domain={[0, 'auto']}
          width={45}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null
            const data = payload[0].payload
            return (
              <div className="rounded-lg bg-[#161a1a] px-3 py-2 shadow-xl">
                <p className="text-[13px] text-[var(--color-neutral-g-400)] font-['Poppins'] leading-5">
                  {data.fullDate}
                </p>
                <p className="text-[16px] font-medium text-white font-['Poppins'] leading-7">
                  ${payload[0].value?.toLocaleString()}
                </p>
              </div>
            )
          }}
        />
        <Area
          type="monotone"
          dataKey="lastPeriod"
          stroke="#d1d5db"
          strokeWidth={2}
          fill="url(#lastPeriodGradient)"
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#b68b69"
          strokeWidth={2}
          fill="url(#costsGradient)"
        />
      </AreaChart>
    </ChartContainer>
  )
}

/**
 * Profit Bar Chart - Monthly bars with current vs last period
 */
function ProfitBarChart({ viewType, currentIndex }: ChartProps) {
  const currentMonth = SIMULATED_MONTH
  const currentDay = SIMULATED_DAY

  const chartData = useMemo(() => {
    const shortMonthNames = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

    // Generate monthly profit data showing current vs last period
    return shortMonthNames.map((month, idx) => {
      const seed = idx * 1000
      const seededRandom = (s: number) => {
        const x = Math.sin(seed + s) * 10000
        return x - Math.floor(x)
      }

      const baseProfit = 2000 + seededRandom(1) * 2000
      const lastPeriodProfit = baseProfit * (0.7 + seededRandom(2) * 0.5)

      return {
        label: month,
        current: Math.round(baseProfit),
        lastPeriod: Math.round(lastPeriodProfit),
      }
    })
  }, [])

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 20, bottom: 30, left: 50 }}
        barGap={2}
      >
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          fontSize={14}
          fontFamily="Poppins"
          fontWeight={500}
          stroke="#8d9291"
          dy={10}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={14}
          fontFamily="Poppins"
          fontWeight={500}
          stroke="#8d9291"
          tickFormatter={(value) => value.toLocaleString()}
          domain={[0, 'auto']}
          width={50}
        />
        <ReferenceLine y={0} stroke="#e5e7e7" />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null
            return (
              <div className="rounded-lg bg-[#161a1a] px-3 py-2 shadow-xl">
                <p className="text-[13px] text-[#c1c5c5] font-['Poppins']">
                  {payload[0].payload.label}
                </p>
                <p className="text-[14px] text-white font-['Poppins']">
                  Current: ${payload[0].payload.current?.toLocaleString()}
                </p>
                <p className="text-[14px] text-[#9ca3af] font-['Poppins']">
                  Last Period: ${payload[0].payload.lastPeriod?.toLocaleString()}
                </p>
              </div>
            )
          }}
        />
        <Bar dataKey="current" radius={[2, 2, 0, 0]} barSize={12}>
          {chartData.map((_, index) => (
            <Cell key={`current-${index}`} fill="#1a1a1a" />
          ))}
        </Bar>
        <Bar dataKey="lastPeriod" radius={[2, 2, 0, 0]} barSize={12}>
          {chartData.map((_, index) => (
            <Cell key={`last-${index}`} fill="#d1d5db" />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

/**
 * View Selector Component
 */
function ViewSelector({
  currentView,
  currentPeriod,
  onViewChange,
  onPeriodSelect,
}: {
  currentView: 'month' | 'year'
  currentPeriod: FinancialPeriod
  onViewChange?: (view: 'month' | 'year') => void
  onPeriodSelect?: (periodId: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const views: Array<{ label: string; value: 'month' | 'year' }> = [
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
  ]

  const getPeriods = (): FinancialPeriod[] => {
    switch (currentView) {
      case 'month':
        return monthlyFinancialData
      case 'year':
        return yearlyFinancialData
      default:
        return monthlyFinancialData
    }
  }

  const periods = getPeriods()

  return (
    <LayoutGroup>
      <div className="relative flex items-center bg-white border border-[var(--color-neutral-g-100)] rounded-full p-1 shadow-sm">
        {views.map(({ label, value }) => {
          const isActive = value === currentView

          if (isActive) {
            return (
              <DropdownMenu key={value} open={isOpen} onOpenChange={setIsOpen} modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative z-10 flex items-center gap-1 px-3 py-[5px] rounded-full text-[15px] font-['Poppins'] cursor-pointer text-[var(--color-primary-p-500)] font-semibold tracking-[-0.3px]"
                  >
                    <motion.div
                      layoutId="activeTabIndicatorReports"
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
              className="relative z-10 px-3 py-[5px] rounded-full text-[15px] font-['Poppins'] cursor-pointer transition-colors text-[var(--color-neutral-n-700)] hover:text-[var(--color-primary-p-500)] tracking-[-0.3px]"
            >
              {label}
            </button>
          )
        })}
      </div>
    </LayoutGroup>
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
