import { useState, useCallback, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { AnimatedNumber } from '@/components/overview/AnimatedNumber'
import {
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, Cell, ReferenceLine, LabelList, AreaChart, Area } from 'recharts'
import {
  getFinancialDataByView,
  type FinancialPeriod,
  SIMULATED_MONTH,
  SIMULATED_DAY,
  SIMULATED_YEAR,
} from '@/lib/quarterly-data'
import { mockFinancialData } from '@/lib/mock-data'
import {
  CreditCard,
  FileSpreadsheet,
  Wallet,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Lightbulb,
  X,
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Zap,
  Wifi,
  Heart,
  Plane,
  GraduationCap,
  Gamepad2,
  Building2,
  Users,
  Truck,
  Package,
} from 'lucide-react'
import { motion, AnimatePresence, LayoutGroup } from 'motion/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

// Category to icon mapping
const categoryIcons: Record<string, typeof Utensils> = {
  'Food & Dining': Utensils,
  'Transportation': Car,
  'Shopping': ShoppingBag,
  'Rent': Home,
  'Utilities': Zap,
  'Internet': Wifi,
  'Healthcare': Heart,
  'Travel': Plane,
  'Education': GraduationCap,
  'Entertainment': Gamepad2,
  'Office': Building2,
  'Payroll': Users,
  'Shipping': Truck,
  'Supplies': Package,
}

// Helper to get current period index based on simulated date
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

export default function DashboardV3() {
  // Dashboard state - shows only current period (no navigation)
  const [viewType, setViewType] = useState<'month' | 'year'>('month')

  // Lightbox state - independent navigation for drilling into historical data
  const [activeLightbox, setActiveLightbox] = useState<'revenue' | 'profit' | null>(null)
  const [lightboxViewType, setLightboxViewType] = useState<'month' | 'year'>('month')
  const [lightboxIndex, setLightboxIndex] = useState(() => getCurrentPeriodIndex('month'))

  // Dashboard always shows current period
  const dashboardData = getFinancialDataByView(viewType)
  const currentPeriodIndex = getCurrentPeriodIndex(viewType)
  const currentPeriod: FinancialPeriod = dashboardData[currentPeriodIndex] || dashboardData[0]

  // Lightbox uses its own data and navigation
  const lightboxData = getFinancialDataByView(lightboxViewType)
  const lightboxPeriod: FinancialPeriod = lightboxData[lightboxIndex] || lightboxData[0]

  // Handle dashboard view type change
  const handleViewChange = useCallback((newView: 'month' | 'year') => {
    setViewType(newView)
  }, [])

  // Handle lightbox navigation
  const handleLightboxNavigate = useCallback((dir: 'prev' | 'next') => {
    setLightboxIndex((prev) => {
      if (dir === 'next') {
        return Math.min(prev + 1, lightboxData.length - 1)
      } else {
        return Math.max(prev - 1, 0)
      }
    })
  }, [lightboxData.length])

  // Handle lightbox view type change
  const handleLightboxViewChange = useCallback((newView: 'month' | 'year') => {
    setLightboxViewType(newView)
    setLightboxIndex(getCurrentPeriodIndex(newView))
  }, [])

  // Handle lightbox period selection from dropdown
  const handleLightboxPeriodSelect = useCallback((periodId: string) => {
    const newIndex = lightboxData.findIndex(p => p.id === periodId)
    if (newIndex !== -1) {
      setLightboxIndex(newIndex)
    }
  }, [lightboxData])

  // Reset lightbox state when opening
  const openLightbox = useCallback((type: 'revenue' | 'profit') => {
    setLightboxViewType(viewType)
    setLightboxIndex(getCurrentPeriodIndex(viewType))
    setActiveLightbox(type)
  }, [viewType])

  const lightboxHasPrev = lightboxIndex > 0
  const lightboxHasNext = lightboxIndex < lightboxData.length - 1

  // Calculate metrics
  const profit = currentPeriod.revenue - currentPeriod.costs

  // Get user's name
  const userName = 'Preston'

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  // Get top spending categories
  const topSpending = useMemo(() => {
    const categories = mockFinancialData.spendingData
    const maxAmount = Math.max(...categories.map(c => c.amount))
    return categories.slice(0, 5).map(cat => ({
      ...cat,
      percentage: (cat.amount / maxAmount) * 100,
      icon: categoryIcons[cat.category] || ShoppingBag,
    }))
  }, [])

  return (
    <LayoutGroup>
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

        {/* Navigation Row - Month/Year toggle (no arrows - dashboard shows current period only) */}
        <div className="flex items-center justify-end mb-5">
          <ViewToggle
            currentView={viewType}
            onViewChange={handleViewChange}
            currentPeriodLabel={currentPeriod.periodLabel}
          />
        </div>

        {/* Main 6-Card Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Revenue Card */}
          <ExpandableCard
            layoutId="revenue-card"
            isExpanded={activeLightbox === 'revenue'}
            onExpand={() => openLightbox('revenue')}
            icon={CreditCard}
            iconColor="#467c75"
            title="Revenue"
            value={currentPeriod.revenue}
            change={{ value: '+12%', isPositive: true }}
            periodLabel="from last month"
            actionLabel="View Chart"
            sparklineData={generateSparklineData()}
            sparklineColor="#467c75"
            expandedContent={
              <ExpandedCardContent
                title="Revenue Overview"
                periods={lightboxData}
                currentIndex={lightboxIndex}
                viewType={lightboxViewType}
                onNavigate={handleLightboxNavigate}
                onViewChange={handleLightboxViewChange}
                onPeriodSelect={handleLightboxPeriodSelect}
                hasPrev={lightboxHasPrev}
                hasNext={lightboxHasNext}
                onClose={() => setActiveLightbox(null)}
              >
                <RevenueAreaChart period={lightboxPeriod} />
              </ExpandedCardContent>
            }
          />

          {/* Costs Card */}
          <DashboardCard
            icon={Wallet}
            iconColor="#b68b69"
            title="Costs"
            value={currentPeriod.costs}
            valueColor="text-[#b68b69]"
            change={{ value: '+5%', isPositive: false }}
            periodLabel="from last month"
            actionLabel="Transactions"
            comparisonBars={[
              { label: 'This Month', value: currentPeriod.costs, maxValue: currentPeriod.costs * 1.2, color: '#b68b69' },
              { label: 'Last Month', value: currentPeriod.costs * 0.95, maxValue: currentPeriod.costs * 1.2, color: '#e5e7e7' },
            ]}
          />

          {/* Profit Card */}
          <ExpandableCard
            layoutId="profit-card"
            isExpanded={activeLightbox === 'profit'}
            onExpand={() => openLightbox('profit')}
            icon={FileSpreadsheet}
            iconColor={profit >= 0 ? '#467c75' : '#dc2626'}
            title={profit >= 0 ? 'Profit' : 'Net Loss'}
            value={Math.abs(profit)}
            valueColor={profit >= 0 ? 'text-[#467c75]' : 'text-[#dc2626]'}
            change={{ value: '+18%', isPositive: true }}
            periodLabel="from last month"
            actionLabel="View Details"
            comparisonBars={[
              { label: 'This Month', value: profit, maxValue: profit * 1.3, color: '#467c75' },
              { label: 'Last Month', value: profit * 0.85, maxValue: profit * 1.3, color: '#e5e7e7' },
            ]}
            expandedContent={
              <ExpandedCardContent
                title="Profit Overview"
                periods={lightboxData}
                currentIndex={lightboxIndex}
                viewType={lightboxViewType}
                onNavigate={handleLightboxNavigate}
                onViewChange={handleLightboxViewChange}
                onPeriodSelect={handleLightboxPeriodSelect}
                hasPrev={lightboxHasPrev}
                hasNext={lightboxHasNext}
                onClose={() => setActiveLightbox(null)}
              >
                <ProfitBarChartLightbox monthNumber={lightboxPeriod.month} />
              </ExpandedCardContent>
            }
          />

          {/* Top Spending Card */}
          <Card className="bg-white rounded-[16px] border-[var(--color-neutral-g-100)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-semibold text-[var(--color-neutral-n-800)] font-['Poppins']">
                Top Spending
              </h3>
              <button className="text-[13px] text-[var(--color-primary-p-500)] font-['Poppins'] hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {topSpending.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#2a4a4715' }}
                    >
                      <Icon className="w-4 h-4" style={{ color: '#2a4a47' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] text-[var(--color-neutral-n-800)] font-['Poppins'] truncate">
                          {item.category}
                        </span>
                        <span className="text-[13px] font-semibold text-[var(--color-neutral-n-800)] font-['Poppins']">
                          ${item.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--color-neutral-g-100)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: '#2a4a47',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Account Balance Card */}
          <Card className="bg-white rounded-[16px] border-[var(--color-neutral-g-100)] p-5">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#467c7515' }}
              >
                <TrendingUp className="w-4 h-4" style={{ color: '#467c75' }} />
              </div>
              <span className="text-[14px] text-[var(--color-neutral-n-600)] font-['Poppins']">
                Account Balance
              </span>
            </div>
            <AnimatedNumber
              value={currentPeriod.cashOnHand}
              className="text-[28px] font-semibold font-['Poppins'] leading-tight tracking-[-0.56px] text-black mb-2"
              format="full"
            />
            <div className="h-[60px]">
              <MiniLineChart data={generateBalanceData()} color="#467c75" />
            </div>
          </Card>

          {/* Bips Insights Card */}
          <Card className="bg-white rounded-[16px] border-[var(--color-neutral-g-100)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#f59e0b15' }}
              >
                <Lightbulb className="w-4 h-4" style={{ color: '#f59e0b' }} />
              </div>
              <span className="text-[16px] font-semibold text-[var(--color-neutral-n-800)] font-['Poppins']">
                Bips Insights
              </span>
            </div>
            <InsightsCarousel />
          </Card>
        </div>

        {/* Backdrop for expanded cards */}
        <AnimatePresence>
          {activeLightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bottom-[80px] bg-black/40 z-40"
              onClick={() => setActiveLightbox(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  )
}

// Expandable Card Component with shared layout animation
interface ExpandableCardProps {
  layoutId: string
  isExpanded: boolean
  onExpand: () => void
  icon: typeof CreditCard
  iconColor: string
  title: string
  value: number
  valueColor?: string
  change: { value: string; isPositive: boolean }
  periodLabel: string
  actionLabel: string
  sparklineData?: number[]
  sparklineColor?: string
  comparisonBars?: Array<{
    label: string
    value: number
    maxValue: number
    color: string
  }>
  expandedContent: React.ReactNode
}

function ExpandableCard({
  layoutId,
  isExpanded,
  onExpand,
  icon: Icon,
  iconColor,
  title,
  value,
  valueColor = 'text-black',
  change,
  periodLabel,
  actionLabel,
  sparklineData,
  sparklineColor,
  comparisonBars,
  expandedContent,
}: ExpandableCardProps) {
  return (
    <div className="relative">
      {/* Card content - stays in place, becomes invisible when expanded */}
      <div
        className={`bg-white rounded-[16px] border border-[var(--color-neutral-g-100)] p-5 cursor-pointer hover:shadow-md transition-all ${
          isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onClick={onExpand}
      >
        {/* Header with icon */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <Icon className="w-4 h-4" style={{ color: iconColor }} />
          </div>
          <span className="text-[14px] text-[var(--color-neutral-n-600)] font-['Poppins']">
            {title}
          </span>
        </div>

        {/* Value */}
        <AnimatedNumber
          value={value}
          className={`text-[28px] font-semibold font-['Poppins'] leading-tight tracking-[-0.56px] ${valueColor} mb-1`}
          format="full"
        />

        {/* Change badge */}
        <div className="mb-3">
          <span className={`text-[13px] font-semibold font-['Poppins'] ${change.isPositive ? 'text-[#4e8a59]' : 'text-[#dc2626]'}`}>
            {change.value}
          </span>
          <span className="text-[13px] text-[var(--color-neutral-n-600)] font-['Poppins']">
            {' '}{periodLabel}
          </span>
        </div>

        {/* Sparkline or Comparison Bars */}
        {sparklineData && sparklineColor && (
          <div className="h-[40px] mb-3">
            <MiniSparkline data={sparklineData} color={sparklineColor} />
          </div>
        )}

        {comparisonBars && (
          <div className="space-y-2 mb-3">
            {comparisonBars.map((bar, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[var(--color-neutral-n-600)] font-['Poppins']">
                    {bar.label}
                  </span>
                  <span className="text-[11px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins']">
                    ${Math.abs(bar.value).toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--color-neutral-g-100)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(Math.abs(bar.value) / bar.maxValue) * 100}%`,
                      backgroundColor: bar.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action link */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onExpand()
          }}
          className="flex items-center gap-1 text-[13px] text-[var(--color-primary-p-500)] font-['Poppins'] hover:underline"
        >
          {actionLabel}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expanded Modal - uses AnimatePresence for smooth animation */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            layoutId={layoutId}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8 pointer-events-none"
            style={{ bottom: '80px' }} // Leave room for chat bar
          >
            <motion.div
              className="bg-white rounded-[20px] shadow-2xl overflow-hidden w-full max-w-[900px] max-h-full pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {expandedContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Expanded Card Content with navigation
interface ExpandedCardContentProps {
  title: string
  periods: FinancialPeriod[]
  currentIndex: number
  viewType: 'month' | 'year'
  onNavigate: (dir: 'prev' | 'next') => void
  onViewChange: (view: 'month' | 'year') => void
  onPeriodSelect: (periodId: string) => void
  hasPrev: boolean
  hasNext: boolean
  onClose: () => void
  children: React.ReactNode
}

function ExpandedCardContent({
  title,
  periods,
  currentIndex,
  viewType,
  onNavigate,
  onViewChange,
  onPeriodSelect,
  hasPrev,
  hasNext,
  onClose,
  children,
}: ExpandedCardContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header with navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-neutral-g-100)]">
        <div className="flex items-center gap-4">
          {/* Navigation arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('prev')}
              disabled={!hasPrev}
              className={`w-8 h-8 rounded-full border border-[var(--color-neutral-g-200)] flex items-center justify-center transition-colors ${
                hasPrev ? 'hover:bg-[var(--color-neutral-g-50)] cursor-pointer' : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4 text-[var(--color-neutral-n-700)]" />
            </button>
            <button
              onClick={() => onNavigate('next')}
              disabled={!hasNext}
              className={`w-8 h-8 rounded-full border border-[var(--color-neutral-g-200)] flex items-center justify-center transition-colors ${
                hasNext ? 'hover:bg-[var(--color-neutral-g-50)] cursor-pointer' : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4 text-[var(--color-neutral-n-700)]" />
            </button>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-[20px] font-semibold text-[var(--color-neutral-n-800)] font-['Poppins']">
              {title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Month/Year toggle with period dropdown */}
          <LightboxViewSelector
            currentView={viewType}
            periods={periods}
            currentIndex={currentIndex}
            onViewChange={onViewChange}
            onPeriodSelect={onPeriodSelect}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-neutral-g-50)] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-neutral-n-600)]" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto flex-1">
        {children}
      </div>
    </div>
  )
}

// Dashboard Card Component (non-expandable)
interface DashboardCardProps {
  icon: typeof CreditCard
  iconColor: string
  title: string
  value: number
  valueColor?: string
  change: { value: string; isPositive: boolean }
  periodLabel: string
  actionLabel: string
  onActionClick?: () => void
  sparklineData?: number[]
  sparklineColor?: string
  comparisonBars?: Array<{
    label: string
    value: number
    maxValue: number
    color: string
  }>
}

function DashboardCard({
  icon: Icon,
  iconColor,
  title,
  value,
  valueColor = 'text-black',
  change,
  periodLabel,
  actionLabel,
  onActionClick,
  sparklineData,
  sparklineColor,
  comparisonBars,
}: DashboardCardProps) {
  return (
    <Card className="bg-white rounded-[16px] border-[var(--color-neutral-g-100)] p-5">
      {/* Header with icon */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
        <span className="text-[14px] text-[var(--color-neutral-n-600)] font-['Poppins']">
          {title}
        </span>
      </div>

      {/* Value */}
      <AnimatedNumber
        value={value}
        className={`text-[28px] font-semibold font-['Poppins'] leading-tight tracking-[-0.56px] ${valueColor} mb-1`}
        format="full"
      />

      {/* Change badge */}
      <div className="mb-3">
        <span className={`text-[13px] font-semibold font-['Poppins'] ${change.isPositive ? 'text-[#4e8a59]' : 'text-[#dc2626]'}`}>
          {change.value}
        </span>
        <span className="text-[13px] text-[var(--color-neutral-n-600)] font-['Poppins']">
          {' '}{periodLabel}
        </span>
      </div>

      {/* Sparkline or Comparison Bars */}
      {sparklineData && sparklineColor && (
        <div className="h-[40px] mb-3">
          <MiniSparkline data={sparklineData} color={sparklineColor} />
        </div>
      )}

      {comparisonBars && (
        <div className="space-y-2 mb-3">
          {comparisonBars.map((bar, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-[var(--color-neutral-n-600)] font-['Poppins']">
                  {bar.label}
                </span>
                <span className="text-[11px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins']">
                  ${Math.abs(bar.value).toLocaleString()}
                </span>
              </div>
              <div className="w-full h-2 bg-[var(--color-neutral-g-100)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(Math.abs(bar.value) / bar.maxValue) * 100}%`,
                    backgroundColor: bar.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action link */}
      <button
        onClick={onActionClick}
        className="flex items-center gap-1 text-[13px] text-[var(--color-primary-p-500)] font-['Poppins'] hover:underline"
      >
        {actionLabel}
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </Card>
  )
}

// Mini Sparkline Component - Minimal 1px trend line
function MiniSparkline({ data }: { data: number[]; color?: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 80 - 10
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="#2a4a47"
        strokeWidth="1"
      />
    </svg>
  )
}

// Mini Line Chart Component - Simple line chart without area fill
function MiniLineChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 80 - 10
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Insights Carousel Component
function InsightsCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const insights = [
    {
      title: 'Spending Alert',
      description: 'Your spending on Software & SaaS increased 23% this month compared to last month.',
    },
    {
      title: 'Cash Flow Trend',
      description: 'Your cash flow has been positive for 3 consecutive months. Great job!',
    },
    {
      title: 'Tax Reminder',
      description: 'Q4 estimated taxes are due soon. Consider setting aside funds.',
    },
  ]

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-[14px] font-semibold text-[var(--color-neutral-n-800)] font-['Poppins'] mb-1">
              {insights[currentSlide].title}
            </p>
            <p className="text-[13px] text-[var(--color-neutral-n-600)] font-['Poppins'] leading-[1.4]">
              {insights[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Carousel dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {insights.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide
                ? 'bg-[var(--color-primary-p-500)]'
                : 'bg-[var(--color-neutral-g-200)]'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// Revenue Area Chart for Lightbox
function RevenueAreaChart({ period }: { period: FinancialPeriod }) {
  // Generate daily revenue data for the month
  const chartData = useMemo(() => {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    const monthIndex = period.month ?? SIMULATED_MONTH
    const numDays = daysInMonth[monthIndex]
    const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthName = shortMonthNames[monthIndex]

    // Seed for consistent data
    const seededRandom = (day: number) => {
      const x = Math.sin((monthIndex * 1000) + day * 123) * 10000
      return x - Math.floor(x)
    }

    const data = []
    let cumulativeRevenue = 0

    // Determine how many days to show based on current vs past period
    const isCurrentMonth = monthIndex === SIMULATED_MONTH
    const daysToShow = isCurrentMonth ? SIMULATED_DAY : numDays

    for (let day = 1; day <= daysToShow; day++) {
      // Daily revenue between $500-$2000
      const dailyRevenue = 500 + Math.round(seededRandom(day) * 1500)
      cumulativeRevenue += dailyRevenue

      data.push({
        day: `${monthName} ${day}`,
        revenue: dailyRevenue,
        cumulative: cumulativeRevenue,
      })
    }

    return data
  }, [period.month])

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--color-neutral-g-50)] rounded-xl p-4">
          <p className="text-[13px] text-[var(--color-neutral-n-600)] font-['Poppins'] mb-1">
            Total Revenue
          </p>
          <p className="text-[24px] font-semibold text-[var(--color-neutral-n-800)] font-['Poppins']">
            ${period.revenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-[var(--color-neutral-g-50)] rounded-xl p-4">
          <p className="text-[13px] text-[var(--color-neutral-n-600)] font-['Poppins'] mb-1">
            Daily Average
          </p>
          <p className="text-[24px] font-semibold text-[var(--color-neutral-n-800)] font-['Poppins']">
            ${Math.round(period.revenue / (chartData.length || 1)).toLocaleString()}
          </p>
        </div>
        <div className="bg-[var(--color-neutral-g-50)] rounded-xl p-4">
          <p className="text-[13px] text-[var(--color-neutral-n-600)] font-['Poppins'] mb-1">
            vs Last Month
          </p>
          <p className="text-[24px] font-semibold text-[#4e8a59] font-['Poppins']">
            +12%
          </p>
        </div>
      </div>

      {/* Area Chart */}
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.revenue} stopOpacity={0.3} />
              <stop offset="100%" stopColor={CHART_COLORS.revenue} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            fontFamily="Poppins"
            stroke="#8d9291"
            tick={{ dy: 10 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={11}
            fontFamily="Poppins"
            stroke="#8d9291"
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
          />
          <ChartTooltip
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null
              const data = payload[0].payload
              return (
                <div className="rounded-lg bg-[#161a1a] px-3 py-2 shadow-xl">
                  <p className="mb-1 text-[13px] text-[#c1c5c5] font-['Poppins']">
                    {data.day}
                  </p>
                  <p className="text-[15px] font-medium text-white font-['Poppins']">
                    ${data.revenue.toLocaleString()}
                  </p>
                </div>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={CHART_COLORS.revenue}
            strokeWidth={2}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}

// Profit Bar Chart for Lightbox (reused from V1/V2)
function ProfitBarChartLightbox({ monthNumber }: { monthNumber?: number }) {
  const currentMonth = SIMULATED_MONTH
  const currentDay = SIMULATED_DAY

  const chartData = useMemo(() => {
    const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    const targetMonth = monthNumber ?? currentMonth
    const monthDays = daysInMonth[targetMonth]
    const monthName = shortMonthNames[targetMonth]
    const isThisCurrentMonth = targetMonth === currentMonth

    const seed = targetMonth * 1000
    const seededRandom = (day: number) => {
      const x = Math.sin(seed + day) * 10000
      return x - Math.floor(x)
    }

    const days = []

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
          isFuture: true,
          isPast: false,
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
        isFuture: false,
        isPast,
        isToday,
        hasNoTransactions,
      })
    }

    return days
  }, [monthNumber, currentMonth, currentDay])

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomLabel = (props: any) => {
    const { x = 0, y = 0, width = 0, height = 0, index = 0 } = props
    const dataPoint = chartDataWithGap[index]
    const hasNoTransactions = dataPoint && dataPoint.hasNoTransactions
    const isFuture = dataPoint && dataPoint.isFuture
    const originalProfit = dataPoint?.profit ?? 0

    if (originalProfit === 0 || hasNoTransactions || isFuture) return null

    const absValue = Math.abs(originalProfit)
    const sign = originalProfit < 0 ? '-' : ''
    const formatted = absValue >= 1000
      ? `$${sign}${(absValue / 1000).toFixed(1)}K`
      : `$${sign}${absValue}`

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
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--color-neutral-g-50)] rounded-xl p-4">
          <p className="text-[13px] text-[var(--color-neutral-n-600)] font-['Poppins'] mb-1">
            Total Profit
          </p>
          <p className="text-[24px] font-semibold text-[#467c75] font-['Poppins']">
            ${chartData.filter(d => !d.hasNoTransactions).reduce((sum, d) => sum + d.profit, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-[var(--color-neutral-g-50)] rounded-xl p-4">
          <p className="text-[13px] text-[var(--color-neutral-n-600)] font-['Poppins'] mb-1">
            Profitable Days
          </p>
          <p className="text-[24px] font-semibold text-[var(--color-neutral-n-800)] font-['Poppins']">
            {chartData.filter(d => d.isProfit && !d.hasNoTransactions).length}
          </p>
        </div>
        <div className="bg-[var(--color-neutral-g-50)] rounded-xl p-4">
          <p className="text-[13px] text-[var(--color-neutral-n-600)] font-['Poppins'] mb-1">
            Loss Days
          </p>
          <p className="text-[24px] font-semibold text-[#b68b69] font-['Poppins']">
            {chartData.filter(d => !d.isProfit && !d.hasNoTransactions).length}
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <BarChart
          data={chartDataWithGap}
          margin={{ top: 30, right: 8, bottom: 8, left: 8 }}
          barCategoryGap="15%"
        >
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={false}
            fontSize={11}
            fontFamily="Poppins"
            stroke="#8d9291"
          />
          <YAxis hide domain={[roundedMin - gapValue, roundedMax + gapValue]} />
          <ReferenceLine y={0} stroke="#e5e7e7" strokeWidth={1} strokeDasharray="4 4" />
          <ChartTooltip
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null
              const dataPoint = payload[0].payload
              const profit = dataPoint.profit
              const hasNoTransactions = dataPoint.hasNoTransactions ?? false
              const isFuture = dataPoint.isFuture ?? false

              if (hasNoTransactions || isFuture) {
                return (
                  <div className="rounded-lg bg-[#161a1a] px-3 py-2 shadow-xl">
                    <p className="mb-1 text-[13px] text-[#c1c5c5] font-['Poppins']">
                      {dataPoint.dateRange}
                    </p>
                    <span className="text-[13px] text-[#8d9291] font-['Poppins']">
                      No transactions
                    </span>
                  </div>
                )
              }

              return (
                <div className="rounded-lg bg-[#161a1a] px-3 py-2 shadow-xl min-w-[180px]">
                  <p className="mb-2 text-[13px] text-[#c1c5c5] font-['Poppins']">
                    {dataPoint.dateRange}
                  </p>
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="text-[13px] text-[#c1c5c5] font-['Poppins']">Revenue</span>
                    <span className="text-[13px] font-medium text-white font-['Poppins']">
                      ${dataPoint.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="text-[13px] text-[#c1c5c5] font-['Poppins']">Costs</span>
                    <span className="text-[13px] font-medium text-white font-['Poppins']">
                      ${dataPoint.costs.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-1 border-t border-[#333]">
                    <span className="text-[13px] text-[#c1c5c5] font-['Poppins']">
                      {profit > 0 ? 'Profit' : 'Loss'}
                    </span>
                    <span className="text-[13px] font-medium text-white font-['Poppins']">
                      ${Math.abs(profit).toLocaleString()}
                    </span>
                  </div>
                </div>
              )
            }}
          />
          <Bar dataKey="displayProfit" radius={[4, 4, 4, 4]}>
            {chartDataWithGap.map((entry, index) => {
              const hasNoTransactions = entry.hasNoTransactions
              let fill: string
              if (hasNoTransactions) {
                fill = '#e5e7e7'
              } else if (entry.profit > 0) {
                fill = CHART_COLORS.profit
              } else {
                fill = CHART_COLORS.loss
              }
              return <Cell key={`cell-${index}`} fill={fill} />
            })}
            <LabelList dataKey="displayProfit" position="top" content={renderCustomLabel} />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  )
}

// View Toggle Component for Dashboard (Month/Year toggle, shows current period only)
function ViewToggle({
  currentView,
  onViewChange,
  currentPeriodLabel,
}: {
  currentView: 'month' | 'year'
  onViewChange: (view: 'month' | 'year') => void
  currentPeriodLabel: string
}) {
  const views: Array<{ label: string; value: 'month' | 'year' }> = [
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
  ]

  return (
    <LayoutGroup id="dashboard-view-toggle">
      <div className="flex items-center gap-3">
        {/* Period Label */}
        <span className="text-[15px] font-medium text-[var(--color-neutral-n-800)] font-['Poppins']">
          {currentPeriodLabel}
        </span>

        {/* Month/Year Toggle */}
        <div className="relative flex items-center bg-white border border-[var(--color-neutral-g-100)] rounded-full p-1">
          {views.map(({ label, value }) => {
            const isActive = value === currentView

            return (
              <button
                key={value}
                onClick={() => onViewChange(value)}
                className={`relative z-10 px-3 py-1.5 rounded-full text-[14px] font-['Poppins'] cursor-pointer transition-colors tracking-[-0.28px] ${
                  isActive
                    ? 'text-[var(--color-primary-p-500)] font-semibold'
                    : 'text-[var(--color-neutral-n-700)] hover:text-[var(--color-primary-p-500)]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="dashboardViewToggleIndicator"
                    className="absolute inset-0 bg-[var(--color-neutral-g-100)] rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </LayoutGroup>
  )
}

// Lightbox View Selector (Month/Year toggle with period dropdown)
function LightboxViewSelector({
  currentView,
  periods,
  currentIndex,
  onViewChange,
  onPeriodSelect,
}: {
  currentView: 'month' | 'year'
  periods: FinancialPeriod[]
  currentIndex: number
  onViewChange: (view: 'month' | 'year') => void
  onPeriodSelect: (periodId: string) => void
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const views: Array<{ label: string; value: 'month' | 'year' }> = [
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
  ]

  return (
    <LayoutGroup id="lightbox-view-toggle">
      <div className="relative flex items-center bg-white border border-[var(--color-neutral-g-100)] rounded-full p-1">
        {views.map(({ label, value }) => {
          const isActive = value === currentView

          if (isActive) {
            return (
              <DropdownMenu key={value} open={isDropdownOpen} onOpenChange={setIsDropdownOpen} modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative z-10 flex items-center gap-1 px-3 py-1.5 rounded-full text-[14px] font-['Poppins'] cursor-pointer text-[var(--color-primary-p-500)] font-semibold tracking-[-0.28px]"
                  >
                    <motion.div
                      layoutId="lightboxViewToggleIndicator"
                      className="absolute inset-0 bg-[var(--color-neutral-g-100)] rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                    <span className="relative z-10">{label}</span>
                    <ChevronDown className={`relative z-10 w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="bottom"
                  sideOffset={8}
                  className="w-[200px] p-2 bg-white border border-[var(--color-neutral-g-100)] rounded-xl shadow-lg max-h-[300px] overflow-y-auto"
                >
                  {periods.map((period, idx) => (
                    <DropdownMenuItem
                      key={period.id}
                      className={`
                        px-3 py-2 rounded-lg cursor-pointer transition-colors text-[14px] font-['Poppins']
                        ${idx === currentIndex
                          ? 'bg-[var(--color-neutral-g-50)] text-[var(--color-primary-p-500)] font-medium'
                          : 'text-[var(--color-neutral-n-700)] hover:bg-[var(--color-neutral-g-50)]'
                        }
                      `}
                      onClick={() => {
                        onPeriodSelect(period.id)
                        setIsDropdownOpen(false)
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
              onClick={() => onViewChange(value)}
              className="relative z-10 px-3 py-1.5 rounded-full text-[14px] font-['Poppins'] cursor-pointer transition-colors text-[var(--color-neutral-n-700)] hover:text-[var(--color-primary-p-500)] tracking-[-0.28px]"
            >
              {label}
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}

// Helper functions
function generateSparklineData(): number[] {
  return Array.from({ length: 12 }, (_, i) => 1000 + Math.sin(i / 2) * 500 + Math.random() * 300)
}

function generateBalanceData(): number[] {
  let balance = 50000
  return Array.from({ length: 30 }, () => {
    balance += (Math.random() - 0.4) * 2000
    return Math.max(balance, 30000)
  })
}
