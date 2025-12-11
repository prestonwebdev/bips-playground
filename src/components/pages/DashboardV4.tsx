/**
 * DashboardV4 - Chat-focused dashboard with metric cards
 *
 * Features:
 * - Welcome message with Bips logo dots
 * - 4 metric cards (Revenue, Profit, Expenses, Account Balances)
 * - Mini line charts using shadcn chart components
 * - Chat bar is focused by default (handled by parent demo)
 */

import { useMemo, useState } from 'react'
import {
  DollarSign,
  Wallet,
  CreditCard,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import { LineChart, Line, Tooltip } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { AnimatedNumber } from '@/components/overview/AnimatedNumber'
import {
  monthlyFinancialData,
  SIMULATED_MONTH,
} from '@/lib/quarterly-data'

/**
 * Generate mock trend data for mini line charts
 */
function generateTrendData(baseValue: number, points: number = 12): { value: number }[] {
  const data: { value: number }[] = []
  let currentValue = baseValue * 0.7

  for (let i = 0; i < points; i++) {
    const trend = (i / points) * 0.4
    const variance = (Math.random() - 0.5) * 0.15
    currentValue = baseValue * (0.7 + trend + variance)
    data.push({ value: Math.round(currentValue) })
  }

  return data
}

/**
 * Bips Logo Dots - Three circles in brand colors
 */
function BipsLogoDots() {
  return (
    <svg
      width="37"
      height="48"
      viewBox="0 0 37 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mb-[var(--space-12)]"
    >
      <circle cx="11.7" cy="35.5" r="10.65" fill="var(--color-primary-p-500)" />
      <circle cx="26.8" cy="15.8" r="8.98" fill="var(--color-primary-p-500)" />
      <circle cx="6.85" cy="6.85" r="6.85" fill="var(--color-primary-p-500)" />
    </svg>
  )
}

/**
 * Get greeting based on time of day
 */
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

/**
 * Custom tooltip for mini charts
 */
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  color?: string
}

function CustomChartTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-[var(--color-neutral-n-800)] px-[var(--space-8)] py-[var(--space-4)] rounded-[var(--radius-8)] shadow-lg">
      <p className="text-[13px] font-medium font-['Poppins'] text-white">
        ${payload[0].value.toLocaleString()}
      </p>
    </div>
  )
}

/**
 * Mini Line Chart for Revenue card
 */
interface MiniLineChartProps {
  data: { value: number }[]
  color?: string
}

function MiniLineChart({ data, color = 'var(--color-primary-p-500)' }: MiniLineChartProps) {
  const chartConfig = {
    value: {
      label: 'Value',
      color: color,
    },
  }

  return (
    <ChartContainer config={chartConfig} className="h-[60px] w-full">
      <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <Tooltip
          content={<CustomChartTooltip color={color} />}
          cursor={false}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{
            r: 4,
            fill: color,
            stroke: 'var(--color-white)',
            strokeWidth: 2,
          }}
        />
      </LineChart>
    </ChartContainer>
  )
}

/**
 * Profit Bar - Horizontal bar showing breakdown of revenue into profit and costs
 */
interface ProfitBarProps {
  revenue: number
  profit: number
  costs: number
}

function ProfitBar({ revenue, profit, costs }: ProfitBarProps) {
  const [hoveredSegment, setHoveredSegment] = useState<'profit' | 'costs' | null>(null)
  const profitPercent = (profit / revenue) * 100
  const costsPercent = (costs / revenue) * 100

  return (
    <div className="relative">
      <div className="flex h-[27px] w-full rounded-[var(--radius-8)] border border-[var(--color-neutral-g-100)] overflow-hidden">
        <div
          className="bg-[var(--color-primary-p-500)] h-full transition-all duration-200 cursor-pointer hover:opacity-80"
          style={{ width: `${profitPercent}%` }}
          onMouseEnter={() => setHoveredSegment('profit')}
          onMouseLeave={() => setHoveredSegment(null)}
        />
        <div
          className="bg-[#b68b69] h-full transition-all duration-200 cursor-pointer hover:opacity-80"
          style={{ width: `${costsPercent}%` }}
          onMouseEnter={() => setHoveredSegment('costs')}
          onMouseLeave={() => setHoveredSegment(null)}
        />
      </div>

      {/* Tooltip */}
      {hoveredSegment && (
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--color-neutral-n-800)] px-[var(--space-8)] py-[var(--space-4)] rounded-[var(--radius-8)] shadow-lg whitespace-nowrap z-10"
        >
          <p className="text-[13px] font-medium font-['Poppins'] text-white">
            {hoveredSegment === 'profit' ? (
              <>Profit: ${profit.toLocaleString()} ({Math.round(profitPercent)}% of revenue)</>
            ) : (
              <>Costs: ${costs.toLocaleString()} ({Math.round(costsPercent)}% of revenue)</>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Metric Card - Individual card for financial metrics
 */
interface MetricCardProps {
  icon: typeof DollarSign
  iconColor?: string
  label: string
  value: number
  valueColor?: string
  insight: React.ReactNode
  visualization?: React.ReactNode
  footerLabel: string
}

function MetricCard({
  icon: Icon,
  iconColor = 'var(--color-neutral-n-600)',
  label,
  value,
  valueColor = 'var(--color-primary-p-800, #1e3834)',
  insight,
  visualization,
  footerLabel,
}: MetricCardProps) {
  return (
    <div className="flex flex-col rounded-[var(--radius-12)] overflow-hidden group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)]">
      {/* Main Card Content */}
      <div className="flex-1 flex flex-col bg-[var(--color-white)] border border-[var(--color-neutral-g-100)] rounded-[var(--radius-12)] p-[var(--space-12)] pb-[var(--space-16)] transition-colors duration-200 group-hover:border-[var(--color-neutral-g-200)]">
        {/* Icon + Label */}
        <div className="flex items-center gap-[var(--space-4)] mb-[var(--space-4)]">
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
          <span
            className="text-[15px] font-normal font-['Poppins'] leading-7 tracking-[-0.3px]"
            style={{ color: 'var(--color-neutral-n-600)' }}
          >
            {label}
          </span>
        </div>

        {/* Value */}
        <div style={{ color: valueColor }}>
          <AnimatedNumber
            value={value}
            format="full"
            className="text-[26px] font-medium font-['Poppins'] leading-10 tracking-[-0.52px] mb-[var(--space-4)]"
          />
        </div>

        {/* Insight Text */}
        <p className="text-[16px] font-normal font-['Poppins'] leading-7 tracking-[-0.32px] text-[var(--color-neutral-n-800)] mb-[var(--space-8)]">
          {insight}
        </p>

        {/* Visualization (optional) */}
        {visualization && (
          <div className="mt-auto pt-[var(--space-8)] w-full">
            {visualization}
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="bg-[var(--color-neutral-g-50)] px-[13px] py-[var(--space-8)] -mt-[10px] pt-[var(--space-16)]">
        <button className="flex items-center gap-[var(--space-12)] text-[13px] font-normal font-['Poppins'] leading-5 tracking-[-0.26px] text-[var(--color-neutral-n-700)] group-hover:text-[var(--color-primary-p-500)] transition-colors">
          {footerLabel}
          <ArrowRight className="w-6 h-6 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  )
}

/**
 * Main DashboardV4 Component
 */
export default function DashboardV4() {
  const userName = 'Preston'

  // Get current period data
  const currentPeriod = monthlyFinancialData[SIMULATED_MONTH]
  const revenue = currentPeriod?.revenue ?? 26820
  const costs = currentPeriod?.costs ?? 4000
  const profit = revenue - costs
  const accountBalance = 26820 // Mock value

  // Generate trend data for charts
  const revenueTrendData = useMemo(() => generateTrendData(revenue), [revenue])

  // Calculate profit margin percentage
  const profitMargin = Math.round((profit / revenue) * 100)

  return (
    <div className="w-full max-w-[1800px] mx-auto">
      {/* Welcome Section - Left aligned */}
      <div className="mb-[var(--space-24)]">
        <BipsLogoDots />

        <h1 className="text-[32px] font-normal font-['Poppins'] leading-[61px] tracking-[-0.64px] text-black mb-0">
          {getGreeting()}, {userName}.
        </h1>

        <p className="text-[16px] font-normal font-['Poppins'] leading-7 tracking-[-0.32px] text-[var(--color-neutral-n-600)]">
          Here are some daily insights to get you started.
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--color-neutral-g-100)] mb-[var(--space-24)]" />

      {/* Section Label - Left aligned */}
      <div className="flex items-center gap-[var(--space-4)] mb-[var(--space-16)]">
        <TrendingUp className="w-4 h-4 text-[var(--color-neutral-n-600)]" />
        <span className="text-[14px] font-normal font-['Poppins'] leading-5 tracking-[-0.28px] text-[var(--color-neutral-n-600)]">
          Pied Piper at a glance
        </span>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[var(--space-20)]">
        {/* Revenue Card */}
        <MetricCard
          icon={DollarSign}
          label="Revenue"
          value={revenue}
          valueColor="var(--color-primary-p-800, #1e3834)"
          insight={
            <>
              Your revenue is looking steady. It is already up{' '}
              <span className="font-bold text-[var(--color-primary-p-500)]">12%</span>{' '}
              from last month.
            </>
          }
          visualization={<MiniLineChart data={revenueTrendData} />}
          footerLabel="View Chart"
        />

        {/* Profit Card */}
        <MetricCard
          icon={Wallet}
          label="Profit"
          value={profit}
          valueColor="var(--color-primary-p-500)"
          insight={
            <>
              Your profit margin is looking healthy at{' '}
              <span className="font-bold text-[var(--color-primary-p-500)]">{profitMargin}%</span>{' '}
              so far this month.
            </>
          }
          visualization={<ProfitBar revenue={revenue} profit={profit} costs={costs} />}
          footerLabel="View Chart"
        />

        {/* Expenses Card */}
        <MetricCard
          icon={CreditCard}
          iconColor="var(--color-neutral-n-600)"
          label="Expenses"
          value={costs}
          valueColor="#b68b69"
          insight={
            <>
              Your biggest expenses this month are{' '}
              <span className="font-bold text-[#b68b69]">Software</span>,{' '}
              <span className="font-bold text-[#b68b69]">Insurance</span>, and{' '}
              <span className="font-bold text-[#b68b69]">Rent</span>.
            </>
          }
          footerLabel="View All Categories"
        />

        {/* Account Balances Card */}
        <MetricCard
          icon={CreditCard}
          label="Account Balances"
          value={accountBalance}
          valueColor="var(--color-primary-p-800, #1e3834)"
          insight={
            <>
              Your account balance is down <span className="font-bold">5%</span>{' '}
              across all of your accounts so far this month.
            </>
          }
          footerLabel="View Accounts"
        />
      </div>
    </div>
  )
}
