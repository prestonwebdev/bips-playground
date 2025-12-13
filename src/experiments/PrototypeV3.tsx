/**
 * PrototypeV3 - Version 3 of the full prototype
 *
 * This is a placeholder that mirrors V2 structure.
 * Customize the overview, reports, and transactions pages for V3.
 */

import { useState, useCallback } from 'react'
import { SidebarProvider, SidebarInset, useSidebar } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import DashboardV4 from '@/components/pages/DashboardV4'
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
  externalPrompt: string | null
  onExternalPromptProcessed: () => void
  initialReportsTab: string | null
  onReportsTabUsed: () => void
}

function DashboardContent({ currentPage, onPageChange, onStartChat, onViewChart, externalPrompt, onExternalPromptProcessed, initialReportsTab, onReportsTabUsed }: DashboardContentProps) {
  const { state } = useSidebar()

  const sidebarWidth = state === 'expanded' ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED

  const renderPage = () => {
    switch (currentPage) {
      case '/overview':
        return <DashboardV4 onStartChat={onStartChat} onViewChart={onViewChart} />
      case '/reports':
        return <ReportsV3 initialTab={initialReportsTab} onInitialTabUsed={onReportsTabUsed} onStartChat={onStartChat} />
      case '/transactions':
        return <Transactions />
      default:
        return <DashboardV4 onStartChat={onStartChat} onViewChart={onViewChart} />
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
        <div className={`relative z-10 ${isOverviewPage ? 'flex-1 flex flex-col justify-center overflow-auto pb-56 px-12' : 'absolute inset-0 overflow-hidden'}`}>
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

  return (
    <SidebarProvider>
      <DashboardContent
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onStartChat={handleStartChat}
        onViewChart={handleViewChart}
        externalPrompt={externalPrompt}
        onExternalPromptProcessed={handleExternalPromptProcessed}
        initialReportsTab={initialReportsTab}
        onReportsTabUsed={handleReportsTabUsed}
      />
    </SidebarProvider>
  )
}
