/**
 * ReportsV3 - V3 Reports page with two-column layout
 *
 * Key differences from V2:
 * - Two-column layout: Chart (left) + Spending Categories (right, always visible)
 * - Profit tab uses 'monthlyComparison' view (this month vs last month only)
 * - Other tabs (Revenue, Costs, Cash) remain the same as V2
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
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
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts'
import { ProfitBarChart as SharedProfitBarChart, CHART_COLORS } from '@/components/charts/ProfitBarChart'
import { AnimatedNumber } from '@/components/overview/AnimatedNumber'
import { motion, AnimatePresence } from 'motion/react'
import {
  getFinancialDataByView,
  type FinancialPeriod,
  SIMULATED_MONTH,
  SIMULATED_YEAR,
  SIMULATED_DAY,
  monthlyFinancialData,
} from '@/lib/quarterly-data'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  DollarSign,
  CreditCard,
  Landmark,
  FileText,
  Wallet,
  Megaphone,
  Monitor,
  Users,
  MessageCircle,
  Building2,
  Briefcase,
  UtensilsCrossed,
  Plane,
  Package,
  Receipt,
  Shield,
  Cloud,
  Car,
  Wrench,
  MoreHorizontal,
  Calendar,
  Percent,
  PartyPopper,
  Banknote,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
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
const SHORT_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * Calculate nice round tick values for Y-axis
 */
function getNiceTickValues(min: number, max: number, targetTickCount: number = 4): number[] {
  const range = max - min
  if (range === 0) return [0]

  const roughStep = range / (targetTickCount - 1)
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)))
  const residual = roughStep / magnitude

  let niceStep: number
  if (residual <= 1.5) niceStep = magnitude
  else if (residual <= 3) niceStep = 2 * magnitude
  else if (residual <= 7) niceStep = 5 * magnitude
  else niceStep = 10 * magnitude

  const niceMin = Math.floor(min / niceStep) * niceStep
  const niceMax = Math.ceil(max / niceStep) * niceStep

  const ticks: number[] = []
  for (let tick = niceMin; tick <= niceMax; tick += niceStep) {
    ticks.push(tick)
  }

  return ticks
}

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
 * Navigation Button
 */
interface NavigationButtonProps {
  direction: 'prev' | 'next'
  onClick: () => void
  disabled?: boolean
}

function NavigationButton({ direction, onClick, disabled }: NavigationButtonProps) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-[38px] h-[38px] rounded-full bg-white border border-[var(--color-neutral-g-200)] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-neutral-g-50)] transition-colors"
    >
      <Icon className="w-5 h-5 text-[var(--color-neutral-n-600)]" />
    </button>
  )
}

/**
 * Period Dropdown
 */
interface PeriodDropdownProps {
  currentPeriod: FinancialPeriod
  viewType: 'month' | 'year'
  onPeriodSelect: (index: number) => void
}

function PeriodDropdown({ currentPeriod, viewType, onPeriodSelect }: PeriodDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const periodLabel = viewType === 'month'
    ? `${MONTH_NAMES[currentPeriod.month ?? 0]} ${currentPeriod.year}`
    : `${currentPeriod.year}`

  // Options ordered most recent first (December at top, 2025 at top)
  const options = viewType === 'month'
    ? MONTH_NAMES.slice(0, SIMULATED_MONTH + 1).map((month, idx) => ({ label: `${month} ${SIMULATED_YEAR}`, idx })).reverse()
    : [2023, 2024, 2025].map((year, idx) => ({ label: `${year}`, idx })).reverse()

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {/* Fixed width (185px) for both month and year to prevent resizing */}
        <button className="flex items-center justify-between px-3 py-1 text-[17px] font-normal text-[var(--color-neutral-n-800)] font-['Poppins'] tracking-[-0.34px] hover:opacity-80 transition-opacity whitespace-nowrap w-[185px]">
          <span>{periodLabel}</span>
          <AnimatedChevron isOpen={isOpen} size={20} className="flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="max-h-[300px] overflow-auto">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.idx}
            onClick={() => onPeriodSelect(option.idx)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Account Balance Types and Data
 */
interface AccountBalance {
  id: string
  name: string
  institution: string
  accountNumber: string
  amount: number
  type: 'checking' | 'savings' | 'credit'
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
      institution: 'Chase',
      accountNumber: '1145',
      type: 'checking',
      amount: Math.round(baseBalances.checking + monthlyGrowth.checking * monthsFromStart * (1 + variance)),
    },
    {
      id: 'savings',
      name: 'Business Savings',
      institution: 'Chase',
      accountNumber: '2224',
      type: 'savings',
      amount: Math.round(baseBalances.savings + monthlyGrowth.savings * monthsFromStart * (1 + variance)),
    },
    {
      id: 'credit',
      name: 'Credit Card',
      institution: 'Wells Fargo',
      accountNumber: '4455',
      type: 'credit',
      amount: -Math.round(baseBalances.creditDebt + monthlyGrowth.creditDebt * monthsFromStart * (1 + variance)),
    },
  ]
}

/**
 * Accounts Section Component (for Cash on Hand tab)
 */
function AccountsSection({ viewType, periodIndex }: { viewType: 'month' | 'year', periodIndex: number }) {
  const accounts = useMemo(() => generateAccountBalances(viewType, periodIndex), [viewType, periodIndex])

  // Separate cash accounts from debt accounts
  const cashAccounts = accounts.filter(acc => acc.amount >= 0)
  const debtAccounts = accounts.filter(acc => acc.amount < 0)

  // Calculate totals
  const totalCash = cashAccounts.reduce((sum, acc) => sum + acc.amount, 0)
  const totalDebt = Math.abs(debtAccounts.reduce((sum, acc) => sum + acc.amount, 0))
  const netCashOnHand = totalCash - totalDebt

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="bg-[var(--color-neutral-g-50)] rounded-lg p-2">
          <Landmark className="w-5 h-5 text-[var(--color-neutral-n-800)]" />
        </div>
        <span className="text-[16px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins'] tracking-[-0.32px]">
          Account Balances
        </span>
      </div>

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
                  {account.institution} ***{account.accountNumber}
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
                  {account.institution} ***{account.accountNumber}
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
 * Spending Categories Component
 */
interface SpendingCategory {
  id: string
  name: string
  icon: LucideIcon
  amount: number
}

function SpendingCategoriesSection({ costs }: { costs: number }) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Generate spending categories based on total costs
  // Categories with spending have percentages, zero-spending categories have 0
  const spendingCategories: SpendingCategory[] = useMemo(() => {
    const categoriesWithSpending = [
      { id: 'payroll', name: 'Payroll & Benefits', icon: Users, percentage: 0.28 },
      { id: 'rent', name: 'Rent & Utilities', icon: Building2, percentage: 0.18 },
      { id: 'software', name: 'Software & Subscriptions', icon: Monitor, percentage: 0.12 },
      { id: 'marketing', name: 'Marketing', icon: Megaphone, percentage: 0.10 },
      { id: 'consulting', name: 'Consulting & Advisors', icon: Briefcase, percentage: 0.08 },
      { id: 'cloud', name: 'Cloud & Hosting', icon: Cloud, percentage: 0.06 },
      { id: 'meals', name: 'Meals & Entertainment', icon: UtensilsCrossed, percentage: 0.05 },
      { id: 'taxes', name: 'Taxes & Licenses', icon: Receipt, percentage: 0.04 },
      { id: 'insurance', name: 'Insurance', icon: Shield, percentage: 0.03 },
      { id: 'bank', name: 'Bank & Processing Fees', icon: Landmark, percentage: 0.02 },
      { id: 'inventory', name: 'Inventory & Supplies', icon: Package, percentage: 0.02 },
      { id: 'team', name: 'Team Perks & Morale', icon: PartyPopper, percentage: 0.02 },
    ]
    const zeroSpendingCategories = [
      { id: 'travel', name: 'Travel', icon: Plane, percentage: 0 },
      { id: 'vehicle', name: 'Vehicle & Transportation', icon: Car, percentage: 0 },
      { id: 'maintenance', name: 'Maintenance & Repairs', icon: Wrench, percentage: 0 },
      { id: 'events', name: 'Events & Conferences', icon: Calendar, percentage: 0 },
      { id: 'interest', name: 'Interest Paid', icon: Percent, percentage: 0 },
      { id: 'loan', name: 'Loan Payments', icon: Banknote, percentage: 0 },
      { id: 'other', name: 'Other Expenses', icon: MoreHorizontal, percentage: 0 },
    ]
    return [...categoriesWithSpending, ...zeroSpendingCategories].map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      amount: Math.round(costs * cat.percentage)
    }))
  }, [costs])

  const categoriesWithSpending = spendingCategories.filter(c => c.amount > 0)
  const categoriesWithoutSpending = spendingCategories.filter(c => c.amount === 0)
  const totalSpending = categoriesWithSpending.reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="bg-[var(--color-neutral-g-50)] rounded-lg p-2">
          <CreditCard className="w-5 h-5 text-[var(--color-neutral-n-800)]" />
        </div>
        <span className="text-[16px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins'] tracking-[-0.32px]">
          Spending Categories
        </span>
      </div>

      {/* Categories List */}
      <div className="flex flex-col gap-3">
        {/* Categories with spending (always visible) */}
        {categoriesWithSpending.map((category) => {
          const Icon = category.icon
          const barWidth = totalSpending > 0 ? (category.amount / totalSpending) * 100 : 0

          return (
            <div key={category.id} className="flex items-center gap-2 whitespace-nowrap">
              <Icon className="w-4 h-4 text-[var(--color-neutral-n-600)] flex-shrink-0" />
              <span className="text-[15px] text-[var(--color-neutral-n-700)] font-['Poppins'] tracking-[-0.3px] w-[120px] flex-shrink-0 truncate">
                {category.name}
              </span>
              <div className="flex-1 h-[7px] bg-[var(--color-neutral-g-100)] rounded-full overflow-hidden min-w-[60px]">
                <div
                  className="h-full bg-[var(--color-neutral-n-800)] rounded-full transition-all duration-300"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className="text-[13px] font-['Poppins'] tracking-[-0.26px] w-[70px] text-right flex-shrink-0 text-[var(--color-neutral-n-800)]">
                ${category.amount.toLocaleString()}
              </span>
            </div>
          )
        })}

        {/* Animated zero-spending categories */}
        <AnimatePresence>
          {isExpanded && categoriesWithoutSpending.map((category, index) => {
            const Icon = category.icon

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.03,
                  ease: 'easeOut'
                }}
                className="flex items-center gap-2 whitespace-nowrap overflow-hidden"
              >
                <Icon className="w-4 h-4 text-[var(--color-neutral-n-600)] flex-shrink-0" />
                <span className="text-[15px] text-[var(--color-neutral-n-700)] font-['Poppins'] tracking-[-0.3px] w-[120px] flex-shrink-0 truncate">
                  {category.name}
                </span>
                <div className="flex-1 h-[7px] bg-[var(--color-neutral-g-100)] rounded-full overflow-hidden min-w-[60px]">
                  <div className="h-full bg-[var(--color-neutral-n-800)] rounded-full" style={{ width: '0%' }} />
                </div>
                <span className="text-[13px] font-['Poppins'] tracking-[-0.26px] w-[70px] text-right flex-shrink-0 text-[var(--color-neutral-n-800)]">
                  $0
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Expand/Collapse button for zero-spending categories */}
        {categoriesWithoutSpending.length > 0 && (
          <motion.button
            layout
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 mt-2 text-[14px] text-[var(--color-neutral-n-500)] font-['Poppins'] tracking-[-0.28px] hover:text-[var(--color-neutral-n-700)] transition-colors"
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
            <span>
              {isExpanded
                ? 'Hide categories with no spending'
                : `+${categoriesWithoutSpending.length} categories with no spending`
              }
            </span>
          </motion.button>
        )}
      </div>
    </div>
  )
}

/**
 * Income Bar Chart (same as V2)
 */
function IncomeBarChart({ viewType, currentIndex, height = 'h-[350px]' }: { viewType: 'month' | 'year', currentIndex: number, height?: string }) {
  const currentDay = SIMULATED_DAY
  const currentMonth = SIMULATED_MONTH

  const chartData = useMemo(() => {
    if (viewType === 'month') {
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      const targetMonth = currentIndex
      const monthDays = daysInMonth[targetMonth] || 31
      const monthName = SHORT_MONTH_NAMES[targetMonth] || 'Dec'
      const isThisCurrentMonth = targetMonth === currentMonth

      const seed = targetMonth * 1000
      const seededRandom = (day: number) => {
        const x = Math.sin(seed + day) * 10000
        return x - Math.floor(x)
      }

      const days = []
      for (let day = 1; day <= monthDays; day++) {
        const isFuture = isThisCurrentMonth && day > currentDay
        const baseRevenue = isFuture ? 0 : 500 + Math.round(seededRandom(day * 2) * 1500)
        days.push({
          label: `${day}`,
          dateRange: `${monthName} ${day}`,
          revenue: baseRevenue,
          isFuture,
        })
      }
      return days
    } else {
      return SHORT_MONTH_NAMES.slice(0, SIMULATED_MONTH + 1).map((month, i) => {
        const monthData = monthlyFinancialData[i]
        return {
          label: month,
          dateRange: month,
          revenue: monthData?.revenue ?? Math.round(20000 + Math.random() * 10000),
          isFuture: false,
        }
      })
    }
  }, [viewType, currentIndex, currentMonth, currentDay])

  const nonFutureData = chartData.filter(d => !d.isFuture)
  const maxValue = Math.max(...nonFutureData.map(d => d.revenue), 0)
  const gapValue = maxValue * 0.005

  const chartDataWithGap = chartData.map(d => ({
    ...d,
    displayRevenue: d.isFuture ? 0 : d.revenue + gapValue,
  }))

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
        <CartesianGrid horizontal={true} vertical={false} stroke="var(--color-neutral-g-100)" />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null
            const data = payload[0].payload
            if (data.isFuture) return null
            return (
              <div className="rounded-lg bg-white/90 backdrop-blur-[3px] border border-[var(--color-neutral-g-100)] px-3 py-2 shadow-lg">
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
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

/**
 * Costs Bar Chart (same as V2)
 */
function CostsBarChart({ viewType, currentIndex, height = 'h-[350px]' }: { viewType: 'month' | 'year', currentIndex: number, height?: string }) {
  const currentDay = SIMULATED_DAY
  const currentMonth = SIMULATED_MONTH

  const chartData = useMemo(() => {
    if (viewType === 'month') {
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      const targetMonth = currentIndex
      const monthDays = daysInMonth[targetMonth] || 31
      const monthName = SHORT_MONTH_NAMES[targetMonth] || 'Dec'
      const isThisCurrentMonth = targetMonth === currentMonth

      const seed = targetMonth * 1000 + 500
      const seededRandom = (day: number) => {
        const x = Math.sin(seed + day) * 10000
        return x - Math.floor(x)
      }

      const days = []
      for (let day = 1; day <= monthDays; day++) {
        const isFuture = isThisCurrentMonth && day > currentDay
        const baseCosts = isFuture ? 0 : 100 + Math.round(seededRandom(day * 2) * 600)
        days.push({
          label: `${day}`,
          dateRange: `${monthName} ${day}`,
          costs: baseCosts,
          isFuture,
        })
      }
      return days
    } else {
      return SHORT_MONTH_NAMES.slice(0, SIMULATED_MONTH + 1).map((month, i) => {
        const monthData = monthlyFinancialData[i]
        return {
          label: month,
          dateRange: month,
          costs: monthData?.costs ?? Math.round(10000 + Math.random() * 5000),
          isFuture: false,
        }
      })
    }
  }, [viewType, currentIndex, currentMonth, currentDay])

  const nonFutureData = chartData.filter(d => !d.isFuture)
  const maxValue = Math.max(...nonFutureData.map(d => d.costs), 0)
  const gapValue = maxValue * 0.005

  const chartDataWithGap = chartData.map(d => ({
    ...d,
    displayCosts: d.isFuture ? 0 : d.costs + gapValue,
  }))

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
        <CartesianGrid horizontal={true} vertical={false} stroke="var(--color-neutral-g-100)" />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null
            const data = payload[0].payload
            if (data.isFuture) return null
            return (
              <div className="rounded-lg bg-white/90 backdrop-blur-[3px] border border-[var(--color-neutral-g-100)] px-3 py-2 shadow-lg">
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
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

/**
 * Cash on Hand Chart - same as V2
 */
// Generate cash history data - daily for month view, monthly YTD for year view
function generateCashOnHandData(viewType: 'month' | 'year', periodIndex: number) {
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
        label: SHORT_MONTH_NAMES[idx],
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

function CashOnHandChart({ viewType, currentIndex, height = 'h-[350px]' }: { viewType: 'month' | 'year', currentIndex: number, height?: string }) {
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
          <linearGradient id="cashGradientV3" x1="0" y1="0" x2="0" y2="1">
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
            const formattedDate = viewType === 'month'
              ? `${SHORT_MONTH_NAMES[currentIndex]} ${data.label}`
              : data.label

            // Show simplified tooltip for future days
            if (data.isFuture) {
              return (
                <div className="rounded-lg bg-white/90 backdrop-blur-[3px] border border-[var(--color-neutral-g-100)] px-3 py-2 shadow-lg">
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
              <div className="rounded-lg bg-white/90 backdrop-blur-[3px] border border-[var(--color-neutral-g-100)] px-3 py-2 shadow-lg min-w-[160px]">
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
                    <span className="text-[13px] font-medium text-[var(--color-loss)]">-${debts.toLocaleString()}</span>
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
          fill="url(#cashGradientV3)"
          connectNulls={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}

/**
 * Main ReportsV3 Component
 */
interface ReportsV3Props {
  initialTab?: string | null
  onInitialTabUsed?: () => void
  onStartChat?: (prompt: string) => void
}

export default function ReportsV3({ initialTab, onInitialTabUsed, onStartChat }: ReportsV3Props) {
  const [viewType, setViewType] = useState<'month' | 'year'>('month')
  const [currentIndex, setCurrentIndex] = useState(SIMULATED_MONTH)
  const [activeTab, setActiveTab] = useState<'profit' | 'revenue' | 'costs' | 'cash'>('profit')

  // Handle initial tab from navigation
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab as 'profit' | 'revenue' | 'costs' | 'cash')
      onInitialTabUsed?.()
    }
  }, [initialTab, onInitialTabUsed])

  // Get current period data
  const currentPeriod = useMemo(() => {
    const data = getFinancialDataByView(viewType)
    return data[currentIndex] || data[0]
  }, [viewType, currentIndex])

  // Navigation handlers
  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentIndex(prev => Math.max(0, prev - 1))
    } else {
      const maxIndex = viewType === 'month' ? SIMULATED_MONTH : SIMULATED_YEAR - 2023
      setCurrentIndex(prev => Math.min(maxIndex, prev + 1))
    }
  }, [viewType])

  const handleViewChange = useCallback((view: 'month' | 'year') => {
    setViewType(view)
    setCurrentIndex(view === 'month' ? SIMULATED_MONTH : SIMULATED_YEAR - 2023)
  }, [])

  const handlePeriodSelect = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Calculate navigation availability
  const hasPrev = currentIndex > 0
  const hasNext = viewType === 'month' ? currentIndex < SIMULATED_MONTH : currentIndex < SIMULATED_YEAR - 2023

  // Calculate cash on hand value and "as of" label for past periods
  const cashOnHandData = useMemo(() => {
    const data = generateCashOnHandData(viewType, currentIndex)
    const validData = data.filter(d => d.total !== null)

    // For current period, get the last valid value (today's value)
    // For past periods, get the last value (end of period value)
    const isCurrentPeriod = viewType === 'month'
      ? currentIndex === SIMULATED_MONTH
      : currentIndex === (SIMULATED_YEAR - 2023)

    const value = validData.length > 0 ? validData[validData.length - 1].total : 0

    // Generate "at the end of" label for past periods
    let asOfLabel: string | null = null
    if (!isCurrentPeriod) {
      if (viewType === 'month') {
        asOfLabel = `at the end of ${MONTH_NAMES[currentIndex]}`
      } else {
        const year = 2023 + currentIndex
        asOfLabel = `at the end of ${year}`
      }
    }

    return { value, asOfLabel }
  }, [viewType, currentIndex])

  // Get current total based on active tab
  const currentTotal = useMemo(() => {
    switch (activeTab) {
      case 'profit':
        return currentPeriod.revenue - currentPeriod.costs
      case 'revenue':
        return currentPeriod.revenue
      case 'costs':
        return currentPeriod.costs
      case 'cash':
        return cashOnHandData.value
      default:
        return currentPeriod.revenue - currentPeriod.costs
    }
  }, [activeTab, currentPeriod, cashOnHandData])

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Fixed Header */}
      <div className="shrink-0 px-12 pt-6 pb-8 bg-white">
        <div className="max-w-[1800px] mx-auto">
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
              <PeriodDropdown currentPeriod={currentPeriod} viewType={viewType} onPeriodSelect={handlePeriodSelect} />
            </div>

            {/* Navigation Arrows - separate circular buttons */}
            <div className="flex items-center gap-4">
              <NavigationButton direction="prev" onClick={() => handleNavigate('prev')} disabled={!hasPrev} />
              <NavigationButton direction="next" onClick={() => handleNavigate('next')} disabled={!hasNext} />
            </div>
          </div>

          {/* Right Side: Action buttons */}
          <div className="flex items-center gap-3">
            {/* Monthly Summary - only shows on past months, not current month */}
            {viewType === 'month' && currentIndex < SIMULATED_MONTH && (
              <button
                onClick={() => {
                  const summaryPrompt = `Give me a summary of my finances for ${MONTH_NAMES[currentIndex]} 2025. Here's what I'm seeing:

Revenue: $${currentPeriod.revenue.toLocaleString()}
Costs: $${currentPeriod.costs.toLocaleString()}
Profit: $${(currentPeriod.revenue - currentPeriod.costs).toLocaleString()}

Top spending categories include Food, Marketing, and Software. Revenue has been trending upward compared to last month, while costs have remained relatively stable. Cash flow is healthy with sufficient runway for the coming months.

Please provide insights and recommendations based on this data.`
                  onStartChat?.(summaryPrompt)
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
      </div>

      {/* Main Content - Two Column Layout with Resizable Panels */}
      <div className="flex-1 overflow-auto px-12 py-6">
        <div className="max-w-[1800px] mx-auto">
        <ResizablePanelGroup direction="horizontal" className="min-h-[500px]">
          {/* Left Column: Charts */}
          <ResizablePanel defaultSize={70} minSize={50}>
            <div className="pr-6">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
                {/* Tabs Row */}
                <div className="flex items-center justify-between mb-6">
                  <TabsList className="bg-transparent p-0 h-auto gap-1">
                    <TabsTrigger
                      value="profit"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium font-['Poppins'] data-[state=active]:bg-[var(--color-neutral-g-100)] data-[state=active]:text-[var(--color-neutral-n-800)] data-[state=active]:shadow-none text-[var(--color-neutral-n-500)] hover:bg-[var(--color-neutral-g-50)]"
                    >
                      <Wallet className="w-4 h-4" />
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
                      <Banknote className="w-4 h-4" />
                      Cash On Hand
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Total Value Display */}
                <div className="mb-6">
                  {/* Label above the number */}
                  <p className="text-[14px] text-[var(--color-neutral-n-500)] font-['Poppins'] mb-1">
                    {activeTab === 'profit' && 'Total Profit'}
                    {activeTab === 'revenue' && 'Total Income'}
                    {activeTab === 'costs' && 'Total Cost'}
                    {activeTab === 'cash' && 'Cash on Hand'}
                  </p>
                  <span className={`text-[48px] font-medium font-['Poppins'] tracking-[-0.96px] leading-[1.1] ${
                    activeTab === 'profit' && currentTotal < 0
                      ? 'text-red-500'
                      : activeTab === 'costs'
                        ? 'text-[#b68b69]'
                        : 'text-[var(--color-neutral-n-800)]'
                  }`}>
                    {activeTab === 'profit' && currentTotal < 0 ? '-' : ''}
                    <AnimatedNumber value={Math.abs(currentTotal)} format="full" duration={0.25} />
                  </span>
                  {/* Subtext: period info */}
                  <p className="text-[14px] text-[var(--color-neutral-n-600)] font-['Poppins'] mt-1">
                    {activeTab === 'cash'
                      ? (cashOnHandData.asOfLabel || (viewType === 'month' ? 'Current balance' : 'Current balance'))
                      : (viewType === 'month'
                          ? (currentIndex === SIMULATED_MONTH ? 'Month to date' : MONTH_NAMES[currentIndex])
                          : (currentIndex === (SIMULATED_YEAR - 2023) ? 'Year to date' : `${2023 + currentIndex}`)
                        )
                    }
                  </p>
                </div>

                {/* Chart Content */}
                <TabsContent value="profit" className="mt-0">
                  {/* Use monthlyComparison for month view, year for year view */}
                  <SharedProfitBarChart
                    viewType={viewType === 'month' ? 'monthlyComparison' : 'year'}
                    monthNumber={currentIndex}
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

          {/* Resizable Handle with visual grip indicator */}
          <ResizableHandle
            withHandle
            className="bg-[var(--color-neutral-g-100)] hover:bg-[var(--color-neutral-g-200)] transition-colors data-[resize-handle-active]:bg-[var(--color-primary-p-100)]"
          />

          {/* Right Column: Spending Categories or Account Balances */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={45}>
            <div className="pl-6 h-full">
              {activeTab === 'cash' ? (
                <AccountsSection viewType={viewType} periodIndex={currentIndex} />
              ) : (
                <SpendingCategoriesSection costs={currentPeriod.costs} />
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        </div>
      </div>
    </div>
  )
}
