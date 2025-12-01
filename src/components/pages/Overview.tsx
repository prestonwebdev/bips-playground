import { useState, useCallback } from 'react'
import { FinancialCard } from '@/components/overview/FinancialCard'
import {
  getFinancialDataByView,
  type FinancialPeriod,
} from '@/lib/quarterly-data'

/**
 * Overview - Main dashboard page with animated financial card
 *
 * Features:
 * - Fade/blur/move transitions when navigating between periods
 * - View switching (Month/Quarter/Year)
 * - Arrow navigation with left/right controls
 * - Dropdown to directly select a specific period
 * - Animated ticker numbers when card comes into view
 */
export default function Overview() {
  const [viewType, setViewType] = useState<'month' | 'quarter' | 'year'>('month')
  const [currentIndex, setCurrentIndex] = useState(7) // Start at August (index 7)
  const [direction, setDirection] = useState<'left' | 'right'>('right')

  // Get data for current view type
  const data = getFinancialDataByView(viewType)
  const currentPeriod: FinancialPeriod = data[currentIndex] || data[0]

  // Handle view type change
  const handleViewChange = useCallback((newView: 'month' | 'quarter' | 'year') => {
    setViewType(newView)
    // Reset to appropriate index for new view
    if (newView === 'month') {
      setCurrentIndex(7) // August
    } else if (newView === 'quarter') {
      setCurrentIndex(2) // Q3
    } else {
      setCurrentIndex(2) // 2025
    }
    setDirection('right')
  }, [])

  // Handle navigation
  const handleNavigate = useCallback((dir: 'prev' | 'next') => {
    const newDirection = dir === 'next' ? 'right' : 'left'
    setDirection(newDirection)

    setCurrentIndex((prev) => {
      if (dir === 'next') {
        return Math.min(prev + 1, data.length - 1)
      } else {
        return Math.max(prev - 1, 0)
      }
    })
  }, [data.length])

  // Handle direct period selection from dropdown
  const handlePeriodSelect = useCallback((periodId: string) => {
    const newIndex = data.findIndex(p => p.id === periodId)
    if (newIndex !== -1 && newIndex !== currentIndex) {
      setDirection(newIndex > currentIndex ? 'right' : 'left')
      setCurrentIndex(newIndex)
    }
  }, [data, currentIndex])

  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < data.length - 1

  return (
    <div className="p-6 bg-[#FAFAFA] min-h-screen flex items-start justify-center">
      <FinancialCard
        data={currentPeriod}
        direction={direction}
        viewType={viewType}
        onViewChange={handleViewChange}
        onNavigate={handleNavigate}
        onPeriodSelect={handlePeriodSelect}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />
    </div>
  )
}
