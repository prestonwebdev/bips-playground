/**
 * DashboardV5 - V3 Overview with redesigned metric cards
 *
 * Features:
 * - Welcome message with Bips logo dots
 * - 3 metric cards (Profit, Costs, Cash On Hand)
 * - Profit card with Revenue/Costs horizontal bars
 * - Costs card with flagged transactions row
 * - Cash On Hand card with account breakdown list
 */

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  MessageCircle,
  Flag,
  Banknote,
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
  onClick?: () => void
}

function HoverableText({ children, tooltipContent, className = '', onClick }: HoverableTextProps) {
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
      className={`relative inline ${onClick ? 'cursor-pointer hover:underline' : 'cursor-default'} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
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
 * Revenue/Costs Bars - Two horizontal bars showing revenue and costs
 */
interface RevenueCostsBarsProps {
  revenue: number
  costs: number
}

function RevenueCostsBars({ revenue, costs }: RevenueCostsBarsProps) {
  // Calculate bar widths (revenue is always 100%, costs is relative to revenue)
  const costsPercent = Math.min((costs / revenue) * 100, 100)

  // Colors - using CSS tokens
  const revenueColor = 'var(--color-chart-revenue)'
  const costsColor = 'var(--color-chart-costs)'

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Revenue Bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center w-[80px] flex-shrink-0">
          <span className="text-[16px] font-normal tracking-[-0.32px] text-[var(--color-neutral-n-700)]">
            Revenue
          </span>
        </div>
        <div className="flex-1 h-[44px]">
          <div
            className="h-full w-full rounded-lg"
            style={{ backgroundColor: revenueColor }}
          />
        </div>
        <span className="text-[18px] font-medium tracking-[-0.36px] text-[var(--color-neutral-n-800)] flex-shrink-0">
          ${revenue.toLocaleString()}
        </span>
      </div>

      {/* Costs Bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center w-[80px] flex-shrink-0">
          <span className="text-[16px] font-normal tracking-[-0.32px] text-[var(--color-neutral-n-700)]">
            Costs
          </span>
        </div>
        <div className="flex-1 h-[44px]">
          <div
            className="h-full rounded-lg"
            style={{ backgroundColor: costsColor, width: `${costsPercent}%` }}
          />
        </div>
        <span className="text-[18px] font-medium tracking-[-0.36px] text-[var(--color-neutral-n-800)] flex-shrink-0">
          ${costs.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

/**
 * Cash On Hand Account List
 */
interface CashOnHandListProps {
  checkingBalance: number
  savingsBalance1: number
  savingsBalance2: number
  creditCardDebt1: number
  creditCardDebt2: number
}

function CashOnHandList({ checkingBalance, savingsBalance1, savingsBalance2, creditCardDebt1, creditCardDebt2 }: CashOnHandListProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Cash Section */}
      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-medium text-[var(--color-neutral-n-700)]">Cash</span>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-normal text-[var(--color-neutral-n-600)]">Chase Business Checking</span>
            <span className="text-[14px] font-medium text-[var(--color-neutral-n-800)]">${checkingBalance.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-normal text-[var(--color-neutral-n-600)]">Chase Business Savings</span>
            <span className="text-[14px] font-medium text-[var(--color-neutral-n-800)]">${savingsBalance1.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-normal text-[var(--color-neutral-n-600)]">Tax Savings</span>
            <span className="text-[14px] font-medium text-[var(--color-neutral-n-800)]">${savingsBalance2.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Debts Section */}
      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-medium text-[var(--color-neutral-n-700)]">Debts</span>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-normal text-[var(--color-neutral-n-600)]">Chase Credit Card</span>
            <span className="text-[14px] font-medium text-[var(--color-loss)]">-${creditCardDebt1.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-normal text-[var(--color-neutral-n-600)]">Wells Fargo Credit Card</span>
            <span className="text-[14px] font-medium text-[var(--color-loss)]">-${creditCardDebt2.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Base Card Component
 */
interface BaseCardProps {
  icon: typeof Wallet
  label: string
  actionLabel: string
  children: React.ReactNode
  prompt: string
  onPromptClick?: (prompt: string) => void
  onActionClick?: () => void
  index?: number
  shouldStagger?: boolean
}

function BaseCard({
  icon: Icon,
  label,
  actionLabel,
  children,
  prompt,
  onPromptClick,
  onActionClick,
  index = 0,
  shouldStagger = false,
}: BaseCardProps) {
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

        {/* Card Content */}
        {children}
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
 * Props for DashboardV5
 */
interface DashboardV5Props {
  onStartChat?: (prompt: string) => void
  onViewChart?: (tab: 'profit' | 'revenue' | 'costs' | 'cashOnHand') => void
  onViewFlaggedTransactions?: () => void
  onViewCostCategory?: (category: string) => void
}

// Module-level flag to track if animation has been shown
let hasAnimatedThisSession = false

/**
 * Main DashboardV5 Component
 */
export default function DashboardV5({ onStartChat, onViewChart, onViewFlaggedTransactions, onViewCostCategory }: DashboardV5Props) {
  const userName = 'Preston'

  // Track if this is the first visit in this session
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

  // Mock data for expenses breakdown (matching new category names)
  const payrollCosts = Math.round(costs * 0.28)
  const rentCosts = Math.round(costs * 0.18)
  const softwareCosts = Math.round(costs * 0.12)

  // Mock data for cash on hand
  const checkingBalance = 14500
  const savingsBalance1 = 500
  const savingsBalance2 = 500
  const creditCardDebt1 = 200
  const creditCardDebt2 = 1500

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

      {/* Metric Cards Row - 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Profit/Loss Card */}
        <BaseCard
          icon={Wallet}
          label={profit >= 0 ? 'Profit' : 'Loss'}
          actionLabel="View Chart"
          prompt={profit >= 0 ? 'How can I increase my profit margins?' : 'How can I reduce my losses?'}
          onPromptClick={handlePromptClick}
          onActionClick={() => onViewChart?.('profit')}
          index={0}
          shouldStagger={shouldStagger}
        >
          {/* Value */}
          <div className="py-3">
            <div className="text-4xl font-medium tracking-[-0.72px] leading-[44px]" style={{ color: profit >= 0 ? 'var(--color-primary-p-500)' : 'var(--color-loss)' }}>
              {profit < 0 && '-'}
              <AnimatedNumber
                value={Math.abs(profit)}
                format="full"
                animate={false}
              />
            </div>
          </div>

          {/* Revenue/Costs Bars */}
          <div className="mt-auto pt-2">
            <RevenueCostsBars revenue={revenue} costs={costs} />
          </div>
        </BaseCard>

        {/* Costs Card */}
        <BaseCard
          icon={CreditCard}
          label="Costs"
          actionLabel="View Breakdown"
          prompt="How could I optimize my expenses?"
          onPromptClick={handlePromptClick}
          onActionClick={() => onViewChart?.('costs')}
          index={1}
          shouldStagger={shouldStagger}
        >
          {/* Value */}
          <div className="py-3">
            <div style={{ color: '#b68b69' }}>
              <AnimatedNumber
                value={costs}
                format="full"
                className="text-4xl font-medium tracking-[-0.72px] leading-[44px]"
                animate={false}
              />
            </div>
          </div>

          {/* Insight Text */}
          <p className="text-base font-normal leading-7 tracking-[-0.32px] text-[var(--color-neutral-n-700)] mb-3">
            Your biggest expenses this month are{' '}
            <HoverableText
              className="font-bold text-[#b68b69]"
              onClick={() => onViewCostCategory?.('Payroll')}
              tooltipContent={
                <>
                  <div className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">Payroll & Benefits</div>
                  <div className="h-px bg-[var(--color-neutral-g-100)] my-2" />
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[var(--color-neutral-n-700)] text-[14px] font-normal font-['Poppins']">Total Spent</span>
                    <span className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">${payrollCosts.toLocaleString()}</span>
                  </div>
                </>
              }
            >
              Payroll
            </HoverableText>
            ,{' '}
            <HoverableText
              className="font-bold text-[#b68b69]"
              onClick={() => onViewCostCategory?.('Utilities')}
              tooltipContent={
                <>
                  <div className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">Rent & Utilities</div>
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
            , and{' '}
            <HoverableText
              className="font-bold text-[#b68b69]"
              onClick={() => onViewCostCategory?.('Software & SaaS')}
              tooltipContent={
                <>
                  <div className="text-[var(--color-neutral-n-800)] text-[15px] font-medium font-['Poppins']">Software & Subscriptions</div>
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
            .
          </p>

          {/* Flagged Transactions Row - Clickable */}
          <button
            onClick={onViewFlaggedTransactions}
            className="flex items-center gap-2 mt-auto pt-2 hover:opacity-70 transition-opacity cursor-pointer"
          >
            <Flag className="w-4 h-4 text-[var(--color-flag)]" />
            <span className="text-[14px] font-normal tracking-[-0.28px] text-[var(--color-neutral-n-700)]">
              2 Transactions Flagged For Review
            </span>
          </button>
        </BaseCard>

        {/* Cash On Hand Card */}
        <BaseCard
          icon={Banknote}
          label="Cash on Hand"
          actionLabel="View Chart"
          prompt="How much should I be saving?"
          onPromptClick={handlePromptClick}
          onActionClick={() => onViewChart?.('cashOnHand')}
          index={2}
          shouldStagger={shouldStagger}
        >
          {/* Account List */}
          <div className="py-3">
            <CashOnHandList
              checkingBalance={checkingBalance}
              savingsBalance1={savingsBalance1}
              savingsBalance2={savingsBalance2}
              creditCardDebt1={creditCardDebt1}
              creditCardDebt2={creditCardDebt2}
            />
          </div>
        </BaseCard>
      </div>
    </div>
  )
}
