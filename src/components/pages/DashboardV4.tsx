/**
 * DashboardV4 - Chat-focused dashboard with metric cards
 *
 * Features:
 * - Welcome message with Bips logo dots
 * - 4 metric cards (Profit, Income, Expenses, Cash On Hand)
 * - Hover tooltips on bold text showing detailed breakdowns
 * - Prompt buttons that trigger chat interactions
 */

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  MessageCircle,
} from 'lucide-react'
import { AnimatedNumber } from '@/components/overview/AnimatedNumber'
import { SmartTooltip } from '@/components/ui/smart-tooltip'
import { IconButton } from '@/components/ui/icon-button'
import {
  monthlyFinancialData,
  SIMULATED_MONTH,
} from '@/lib/quarterly-data'

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
      className="mb-3"
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
 * Hoverable text with tooltip
 */
interface HoverableTextProps {
  children: React.ReactNode
  tooltipContent: React.ReactNode
  className?: string
}

function HoverableText({ children, tooltipContent, className = '' }: HoverableTextProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)
  const triggerRef = useRef<HTMLSpanElement>(null)

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect())
    }
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setTriggerRect(null)
  }

  return (
    <span
      ref={triggerRef}
      className={`relative inline cursor-default ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <SmartTooltip triggerRect={triggerRect} variant="light">
            {tooltipContent}
          </SmartTooltip>
        )}
      </AnimatePresence>
    </span>
  )
}

/**
 * Profit Segmented Bar - Horizontal bar showing costs vs profit breakdown
 */
interface ProfitSegmentedBarProps {
  costsPercent: number
  revenue: number
  costs: number
  profit: number
}

function ProfitSegmentedBar({ costsPercent, revenue, costs, profit }: ProfitSegmentedBarProps) {
  const [isHovered, setIsHovered] = useState(false)
  const totalSegments = 42
  const costsSegments = Math.round((costsPercent / 100) * totalSegments)

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Segmented bar with hover tooltip */}
      <div
        className="relative flex gap-[2px] h-7 w-full cursor-default"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {Array.from({ length: totalSegments }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-[4px]"
            style={{
              backgroundColor: i < costsSegments ? '#b68b69' : 'var(--color-primary-p-500)',
            }}
          />
        ))}
        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[100] rounded-lg bg-white/90 backdrop-blur-[3px] px-3 py-2 border border-[var(--color-neutral-g-100)] shadow-[0px_5px_13px_0px_rgba(0,0,0,0.04),0px_20px_24px_0px_rgba(0,0,0,0.06)] whitespace-nowrap"
            >
              <div className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">December 2025</div>
              <div className="h-px bg-[var(--color-neutral-g-100)] my-2" />
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-1">
                    <div className="w-[9px] h-[9px] rounded-full bg-[#1e3834]" />
                    <span className="text-[var(--color-neutral-n-700)] text-[14px] font-normal font-['Poppins']">Income</span>
                  </div>
                  <span className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">${revenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-1">
                    <div className="w-[9px] h-[9px] rounded-full bg-[#b68b69]" />
                    <span className="text-[var(--color-neutral-n-700)] text-[14px] font-normal font-['Poppins']">Costs</span>
                  </div>
                  <span className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">${costs.toLocaleString()}</span>
                </div>
                <div className="h-px bg-[var(--color-neutral-g-100)] my-1" />
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-1">
                    <div className="w-[9px] h-[9px] rounded-full bg-[var(--color-primary-p-500)]" />
                    <span className="text-[var(--color-neutral-n-700)] text-[14px] font-normal font-['Poppins']">Profit</span>
                  </div>
                  <span className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">${profit.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <div className="w-[10px] h-[10px] rounded-full bg-[#b68b69]" />
          <span className="text-sm font-normal tracking-[-0.28px] text-[var(--color-neutral-n-700)]">
            Costs
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-[10px] h-[10px] rounded-full bg-[var(--color-primary-p-500)]" />
          <span className="text-sm font-normal tracking-[-0.28px] text-[var(--color-neutral-n-700)]">
            Profit
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Chase bank icon SVG
 */
function ChaseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect width="20" height="20" rx="10" fill="#117ACA" />
      <path d="M5 10h10M10 5v10" stroke="white" strokeWidth="2.5" />
    </svg>
  )
}

/**
 * Wells Fargo icon SVG
 */
function WellsFargoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect width="20" height="20" rx="10" fill="#D71E28" />
      <text x="10" y="14" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif">WF</text>
    </svg>
  )
}

/**
 * Assets/Debts visualization for Cash On Hand card
 */
interface AssetsDebtsProps {
  assets: number
  debts: number
  checkingBalance: number
  savingsBalance1: number
  savingsBalance2: number
}

function AssetsDebts({ assets, debts, checkingBalance, savingsBalance1, savingsBalance2 }: AssetsDebtsProps) {
  const [assetsHovered, setAssetsHovered] = useState(false)
  const [debtsHovered, setDebtsHovered] = useState(false)

  return (
    <div className="flex items-center gap-5 w-full">
      {/* Assets */}
      <div
        className="relative flex-1 flex flex-col gap-[2px] cursor-default"
        onMouseEnter={() => setAssetsHovered(true)}
        onMouseLeave={() => setAssetsHovered(false)}
      >
        <span className="text-[15px] font-normal tracking-[-0.3px] text-[var(--color-neutral-n-700)] h-5">
          Assets
        </span>
        <div className="flex items-center gap-2">
          {/* Stacked bank icons */}
          <div className="flex items-start pr-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full bg-white border border-white -ml-2 first:ml-0 overflow-hidden flex items-center justify-center"
              >
                <ChaseIcon />
              </div>
            ))}
          </div>
          <span className="text-base font-medium tracking-[-0.32px] text-[var(--color-primary-p-800)]">
            ${assets.toLocaleString()}
          </span>
        </div>
        {/* Assets Tooltip */}
        <AnimatePresence>
          {assetsHovered && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute bottom-full left-0 mb-2 z-[100] rounded-lg bg-white/90 backdrop-blur-[3px] px-3 py-2 border border-[var(--color-neutral-g-100)] shadow-[0px_5px_13px_0px_rgba(0,0,0,0.04),0px_20px_24px_0px_rgba(0,0,0,0.06)] whitespace-nowrap"
            >
              <div className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">Checking / Savings</div>
              <div className="h-px bg-[var(--color-neutral-g-100)] my-2" />
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--color-neutral-n-700)] text-[14px] font-normal font-['Poppins']">Chase ***1145</span>
                  <span className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">${checkingBalance.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--color-neutral-n-700)] text-[14px] font-normal font-['Poppins']">Chase ***2224</span>
                  <span className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">${savingsBalance1.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--color-neutral-n-700)] text-[14px] font-normal font-['Poppins']">Chase ***2224</span>
                  <span className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">${savingsBalance2.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="w-px h-[50px] bg-[var(--color-neutral-g-100)]" />

      {/* Debts */}
      <div
        className="relative flex-1 flex flex-col gap-[2px] cursor-default"
        onMouseEnter={() => setDebtsHovered(true)}
        onMouseLeave={() => setDebtsHovered(false)}
      >
        <span className="text-[15px] font-normal tracking-[-0.3px] text-[var(--color-neutral-n-700)] h-5">
          Debts
        </span>
        <div className="flex items-center gap-2">
          {/* Wells Fargo icon */}
          <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center">
            <WellsFargoIcon />
          </div>
          <span className="text-base font-medium tracking-[-0.32px] text-[#ac4545]">
            -${Math.abs(debts).toLocaleString()}
          </span>
        </div>
        {/* Debts Tooltip */}
        <AnimatePresence>
          {debtsHovered && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute bottom-full right-0 mb-2 z-[100] rounded-lg bg-white/90 backdrop-blur-[3px] px-3 py-2 border border-[var(--color-neutral-g-100)] shadow-[0px_5px_13px_0px_rgba(0,0,0,0.04),0px_20px_24px_0px_rgba(0,0,0,0.06)] whitespace-nowrap"
            >
              <div className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">Credit Cards</div>
              <div className="h-px bg-[var(--color-neutral-g-100)] my-2" />
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--color-neutral-n-700)] text-[14px] font-normal font-['Poppins']">Wells Fargo ***4455</span>
                  <span className="text-[#ac4545] text-[15px] font-medium font-['Poppins']">-${Math.abs(debts).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/**
 * Metric Card - Individual card for financial metrics
 */
interface MetricCardProps {
  icon: typeof Wallet
  label: string
  actionLabel: string
  value: number
  valueColor?: string
  insight: React.ReactNode
  visualization?: React.ReactNode
  prompt: string
  onPromptClick?: (prompt: string) => void
  onActionClick?: () => void
  index?: number
  shouldStagger?: boolean
}

function MetricCard({
  icon: Icon,
  label,
  actionLabel,
  value,
  valueColor = 'var(--color-primary-p-800)',
  insight,
  visualization,
  prompt,
  onPromptClick,
  onActionClick,
  index = 0,
  shouldStagger = false,
}: MetricCardProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleActionMouseEnter = () => {
    tooltipTimeoutRef.current = setTimeout(() => {
      if (buttonRef.current) {
        setButtonRect(buttonRef.current.getBoundingClientRect())
      }
      setShowTooltip(true)
    }, 400)
  }

  const handleActionMouseLeave = () => {
    setShowTooltip(false)
    setButtonRect(null)
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
      tooltipTimeoutRef.current = null
    }
  }

  const cardContent = (
    <div className="flex flex-col rounded-xl border border-[var(--color-neutral-g-200)] overflow-hidden h-full">
      {/* Main Card Content */}
      <div className="relative flex-1 flex flex-col bg-white border border-[var(--color-neutral-g-100)] rounded-xl px-5 pt-3 pb-4 -mb-[10px] z-[2]">
        {/* Header: Icon + Label */}
        <div className="flex items-center gap-1 mb-1">
          <Icon className="w-4 h-4 text-[var(--color-neutral-n-700)]" />
          <span className="text-[15px] font-normal tracking-[-0.3px] text-[var(--color-neutral-n-700)] leading-7">
            {label}
          </span>
        </div>

        {/* Action Button - Positioned absolutely */}
        <div
          className="absolute top-4 right-4"
          onMouseEnter={handleActionMouseEnter}
          onMouseLeave={handleActionMouseLeave}
        >
          <IconButton
            ref={buttonRef}
            onClick={onActionClick}
            size="md"
          >
            <ArrowUpRight className="w-5 h-5" />
          </IconButton>
          <AnimatePresence>
            {showTooltip && buttonRect && (
              <SmartTooltip triggerRect={buttonRect} variant="dark">
                <span className="text-[var(--color-white)] text-[14px] font-normal font-['Poppins']">{actionLabel}</span>
              </SmartTooltip>
            )}
          </AnimatePresence>
        </div>

        {/* Value - No animation */}
        <div className="py-3">
          <div style={{ color: valueColor }}>
            <AnimatedNumber
              value={value}
              format="full"
              className="text-4xl font-medium tracking-[-0.72px] leading-[44px]"
              animate={false}
            />
          </div>
        </div>

        {/* Insight Text */}
        <p className="text-base font-normal leading-7 tracking-[-0.32px] text-[var(--color-neutral-n-700)] mb-2">
          {insight}
        </p>

        {/* Visualization (optional) */}
        {visualization && (
          <div className="mt-auto pt-2 w-full">
            {visualization}
          </div>
        )}
      </div>

      {/* Prompt Footer */}
      <button
        onClick={() => onPromptClick?.(prompt)}
        className="bg-[#f6f6f6] border border-white rounded-b-xl px-3 py-3 pt-5 z-[1] flex items-center gap-1 hover:bg-[#f0f0f0] transition-colors cursor-pointer text-left"
      >
        <MessageCircle className="w-4 h-4 text-[#393939] flex-shrink-0" />
        <span className="text-sm font-normal tracking-[-0.28px] text-[#393939]">
          {prompt}
        </span>
      </button>
    </div>
  )

  // If stagger animation is enabled, wrap in motion.div
  if (shouldStagger) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: index * 0.1,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        {cardContent}
      </motion.div>
    )
  }

  return cardContent
}

/**
 * Props for DashboardV4
 */
interface DashboardV4Props {
  onStartChat?: (prompt: string) => void
  onViewChart?: (tab: 'profit' | 'revenue' | 'costs' | 'cashOnHand') => void
}

// Module-level flag to track if animation has been shown
// Resets on page refresh, persists during navigation
let hasAnimatedThisSession = false

/**
 * Main DashboardV4 Component
 */
export default function DashboardV4({ onStartChat, onViewChart }: DashboardV4Props) {
  const userName = 'Preston'

  // Track if this is the first visit in this session
  // Using lazy initializer to check synchronously before first render
  const [shouldStagger] = useState(() => {
    if (!hasAnimatedThisSession) {
      hasAnimatedThisSession = true
      return true
    }
    return false
  })

  // Get current month data from quarterly-data
  const currentPeriod = monthlyFinancialData[SIMULATED_MONTH]
  const revenue = currentPeriod?.revenue ?? 10000
  const costs = currentPeriod?.costs ?? 6000
  const profit = revenue - costs
  const cashOnHand = currentPeriod?.cashOnHand ?? 16500

  // Mock data for detailed breakdowns
  const stripeRevenue = Math.round(revenue * 0.88) // 88% from Stripe
  const softwareCosts = Math.round(costs * 0.35)
  const insuranceCosts = Math.round(costs * 0.25)
  const rentCosts = Math.round(costs * 0.20)

  // Asset breakdown (mock)
  const assets = Math.round(cashOnHand * 0.88)
  const debts = Math.round(cashOnHand * 0.12)

  // Account breakdown for tooltip
  const checkingBalance = Math.round(assets * 0.69)
  const savingsBalance1 = Math.round(assets * 0.28)
  const savingsBalance2 = Math.round(assets * 0.03)

  // Calculate percentages
  const profitPercent = Math.round((profit / revenue) * 100)
  const costsPercent = 100 - profitPercent

  // Calculate runway (months of expenses covered by cash)
  const runwayMonths = (cashOnHand / costs).toFixed(1)

  // Handle prompt click
  const handlePromptClick = useCallback((prompt: string) => {
    if (onStartChat) {
      onStartChat(prompt)
    } else {
      console.log('Prompt clicked:', prompt)
    }
  }, [onStartChat])

  return (
    <div className="w-full">
      {/* Welcome Section */}
      <div className="mb-8">
        <BipsLogoDots />

        <h1 className="text-[50px] font-normal leading-[61px] tracking-[-1px] text-black mb-[2px]">
          {getGreeting()}, {userName}.
        </h1>

        <p className="text-lg leading-8 tracking-[-0.36px] text-[#8d9291]" style={{ fontWeight: 400 }}>
          December is looking great so far! Here's what I am seeing.
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--color-neutral-g-100)] mb-8" />

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Profit Card */}
        <MetricCard
          icon={Wallet}
          label="Profit"
          actionLabel="View Chart"
          value={profit}
          valueColor="var(--color-primary-p-500)"
          insight={
            <>
              Your profit margin is healthy at {profitPercent}% so far this month.
            </>
          }
          visualization={
            <ProfitSegmentedBar
              costsPercent={costsPercent}
              revenue={revenue}
              costs={costs}
              profit={profit}
            />
          }
          prompt="How can I increase my profit margins?"
          onPromptClick={handlePromptClick}
          onActionClick={() => onViewChart?.('profit')}
          index={0}
          shouldStagger={shouldStagger}
        />

        {/* Income Card */}
        <MetricCard
          icon={Wallet}
          label="Income"
          actionLabel="View Chart"
          value={revenue}
          valueColor="var(--color-primary-p-800)"
          insight={
            <>
              Most of your revenue came from{' '}
              <HoverableText
                className="font-bold text-[var(--color-neutral-n-800)]"
                tooltipContent={
                  <>
                    <div className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">Stripe</div>
                    <div className="h-px bg-[var(--color-neutral-g-100)] my-2" />
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[var(--color-neutral-n-700)] text-[14px] font-normal font-['Poppins']">Total Earned</span>
                      <span className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">${stripeRevenue.toLocaleString()}</span>
                    </div>
                  </>
                }
              >
                Stripe
              </HoverableText>{' '}
              payouts.
            </>
          }
          prompt="Break it down for me"
          onPromptClick={handlePromptClick}
          onActionClick={() => onViewChart?.('revenue')}
          index={1}
          shouldStagger={shouldStagger}
        />

        {/* Costs Card */}
        <MetricCard
          icon={CreditCard}
          label="Costs"
          actionLabel="View Breakdown"
          value={costs}
          valueColor="#b68b69"
          insight={
            <>
              Your biggest expenses this month are{' '}
              <HoverableText
                className="font-bold text-[#b68b69]"
                tooltipContent={
                  <>
                    <div className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">Software</div>
                    <div className="h-px bg-[var(--color-neutral-g-100)] my-2" />
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[var(--color-neutral-n-700)] text-[14px] font-normal font-['Poppins']">Total Spent</span>
                      <span className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">${softwareCosts.toLocaleString()}</span>
                    </div>
                  </>
                }
              >
                Software
              </HoverableText>
              ,{' '}
              <HoverableText
                className="font-bold text-[#b68b69]"
                tooltipContent={
                  <>
                    <div className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">Insurance</div>
                    <div className="h-px bg-[var(--color-neutral-g-100)] my-2" />
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[var(--color-neutral-n-700)] text-[14px] font-normal font-['Poppins']">Total Spent</span>
                      <span className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">${insuranceCosts.toLocaleString()}</span>
                    </div>
                  </>
                }
              >
                Insurance
              </HoverableText>
              , and{' '}
              <HoverableText
                className="font-bold text-[#b68b69]"
                tooltipContent={
                  <>
                    <div className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">Rent</div>
                    <div className="h-px bg-[var(--color-neutral-g-100)] my-2" />
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[var(--color-neutral-n-700)] text-[14px] font-normal font-['Poppins']">Total Spent</span>
                      <span className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">${rentCosts.toLocaleString()}</span>
                    </div>
                  </>
                }
              >
                Rent
              </HoverableText>
              .
            </>
          }
          prompt="How could I optimize my expenses?"
          onPromptClick={handlePromptClick}
          onActionClick={() => onViewChart?.('costs')}
          index={2}
          shouldStagger={shouldStagger}
        />

        {/* Cash On Hand Card */}
        <MetricCard
          icon={Wallet}
          label="Cash On Hand"
          actionLabel="View Chart"
          value={cashOnHand}
          valueColor="var(--color-primary-p-800)"
          insight={
            <>
              Your current cash would cover about{' '}
              <HoverableText
                className="font-bold text-[var(--color-neutral-n-800)]"
                tooltipContent={
                  <>
                    <div className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">Estimated Runway</div>
                    <div className="h-px bg-[var(--color-neutral-g-100)] my-2" />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[var(--color-neutral-n-700)] text-[14px] font-normal font-['Poppins']">Current Balance</span>
                        <span className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">${cashOnHand.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[var(--color-neutral-n-700)] text-[14px] font-normal font-['Poppins']">Avg. Monthly Costs</span>
                        <span className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">${costs.toLocaleString()}</span>
                      </div>
                      <div className="h-px bg-[var(--color-neutral-g-100)] my-1" />
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[var(--color-neutral-n-700)] text-[14px] font-normal font-['Poppins']">Estimated Runway</span>
                        <span className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">{runwayMonths} months</span>
                      </div>
                    </div>
                  </>
                }
              >
                {runwayMonths}
              </HoverableText>{' '}
              months of expenses.
            </>
          }
          visualization={
            <AssetsDebts
              assets={assets}
              debts={debts}
              checkingBalance={checkingBalance}
              savingsBalance1={savingsBalance1}
              savingsBalance2={savingsBalance2}
            />
          }
          prompt="How much should I be saving?"
          onPromptClick={handlePromptClick}
          onActionClick={() => onViewChart?.('cashOnHand')}
          index={3}
          shouldStagger={shouldStagger}
        />
      </div>
    </div>
  )
}
