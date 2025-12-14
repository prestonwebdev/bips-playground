/**
 * PrototypeV3 - Version 3 of the full prototype
 *
 * This is a placeholder that mirrors V2 structure.
 * Customize the overview, reports, and transactions pages for V3.
 */

import { useState, useCallback } from 'react'
import { SidebarProvider, SidebarInset, useSidebar } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import DashboardV5 from '@/components/pages/DashboardV5'
import ReportsV3 from '@/components/pages/ReportsV3'
import Transactions from '@/components/pages/Transactions'
import ChatBar from '@/components/ChatBar'
import { UnicornAnimation } from '@/components/UnicornAnimation'

// Sidebar widths matching sidebar.tsx
const SIDEBAR_WIDTH_EXPANDED = 324
const SIDEBAR_WIDTH_COLLAPSED = 80

interface DashboardContentProps {
  currentPage: string
  onPageChange: (page: string) => void
  onStartChat: (prompt: string) => void
  onViewChart: (tab: 'profit' | 'revenue' | 'costs' | 'cashOnHand') => void
  onViewFlaggedTransactions: () => void
  onViewCostCategory: (category: string) => void
  externalPrompt: string | null
  onExternalPromptProcessed: () => void
  initialReportsTab: string | null
  onReportsTabUsed: () => void
  showFlaggedTransactions: boolean
  onFlaggedFilterUsed: () => void
  initialCategoryFilter: string | null
  onCategoryFilterUsed: () => void
}

function DashboardContent({ currentPage, onPageChange, onStartChat, onViewChart, onViewFlaggedTransactions, onViewCostCategory, externalPrompt, onExternalPromptProcessed, initialReportsTab, onReportsTabUsed, showFlaggedTransactions, onFlaggedFilterUsed, initialCategoryFilter, onCategoryFilterUsed }: DashboardContentProps) {
  const { state } = useSidebar()

  const sidebarWidth = state === 'expanded' ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED

  const renderPage = () => {
    switch (currentPage) {
      case '/overview':
        return <DashboardV5 onStartChat={onStartChat} onViewChart={onViewChart} onViewFlaggedTransactions={onViewFlaggedTransactions} onViewCostCategory={onViewCostCategory} />
      case '/reports':
        return <ReportsV3 initialTab={initialReportsTab} onInitialTabUsed={onReportsTabUsed} onStartChat={onStartChat} />
      case '/transactions':
        return <Transactions initialShowFlagged={showFlaggedTransactions} onFlaggedFilterUsed={onFlaggedFilterUsed} initialCategory={initialCategoryFilter} onCategoryFilterUsed={onCategoryFilterUsed} />
      default:
        return <DashboardV5 onStartChat={onStartChat} onViewChart={onViewChart} onViewFlaggedTransactions={onViewFlaggedTransactions} onViewCostCategory={onViewCostCategory} />
    }
  }

  const isOverviewPage = currentPage === '/overview'

  return (
    <>
      <AppSidebar activePage={currentPage} onPageChange={onPageChange} sidebarBg="gray" />
      <SidebarInset className="flex-1 relative bg-white">
        {/* Unicorn Animation - Full size background, only on Overview */}
        {isOverviewPage && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <UnicornAnimation
              projectId="7lQajH71KPzS88qL2ky2"
              width="100%"
              height="100%"
            />
          </div>
        )}
        <div className={`z-10 ${isOverviewPage ? 'relative flex-1 flex flex-col justify-center overflow-auto pb-56 px-12' : 'absolute inset-0'}`}>
          {renderPage()}
        </div>
      </SidebarInset>
      <ChatBar
        contentOffset={sidebarWidth}
        defaultFocused
        externalPrompt={externalPrompt}
        onExternalPromptProcessed={onExternalPromptProcessed}
      />
    </>
  )
}

export default function PrototypeV3() {
  const [currentPage, setCurrentPage] = useState('/overview')
  const [externalPrompt, setExternalPrompt] = useState<string | null>(null)
  const [initialReportsTab, setInitialReportsTab] = useState<string | null>(null)
  const [showFlaggedTransactions, setShowFlaggedTransactions] = useState(false)
  const [initialCategoryFilter, setInitialCategoryFilter] = useState<string | null>(null)

  const handleStartChat = useCallback((prompt: string) => {
    setExternalPrompt(prompt)
  }, [])

  const handleExternalPromptProcessed = useCallback(() => {
    setExternalPrompt(null)
  }, [])

  const handleViewChart = useCallback((tab: 'profit' | 'revenue' | 'costs' | 'cashOnHand') => {
    setInitialReportsTab(tab)
    setCurrentPage('/reports')
  }, [])

  const handleReportsTabUsed = useCallback(() => {
    setInitialReportsTab(null)
  }, [])

  const handleViewFlaggedTransactions = useCallback(() => {
    setShowFlaggedTransactions(true)
    setCurrentPage('/transactions')
  }, [])

  const handleFlaggedFilterUsed = useCallback(() => {
    setShowFlaggedTransactions(false)
  }, [])

  const handleViewCostCategory = useCallback((category: string) => {
    setInitialCategoryFilter(category)
    setCurrentPage('/transactions')
  }, [])

  const handleCategoryFilterUsed = useCallback(() => {
    setInitialCategoryFilter(null)
  }, [])

  return (
    <SidebarProvider>
      <DashboardContent
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onStartChat={handleStartChat}
        onViewChart={handleViewChart}
        onViewFlaggedTransactions={handleViewFlaggedTransactions}
        onViewCostCategory={handleViewCostCategory}
        externalPrompt={externalPrompt}
        onExternalPromptProcessed={handleExternalPromptProcessed}
        initialReportsTab={initialReportsTab}
        onReportsTabUsed={handleReportsTabUsed}
        showFlaggedTransactions={showFlaggedTransactions}
        onFlaggedFilterUsed={handleFlaggedFilterUsed}
        initialCategoryFilter={initialCategoryFilter}
        onCategoryFilterUsed={handleCategoryFilterUsed}
      />
    </SidebarProvider>
  )
}
