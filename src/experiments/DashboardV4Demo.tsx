/**
 * DashboardV4Demo - Demo wrapper for DashboardV4
 *
 * Features:
 * - Sidebar navigation with page switching
 * - ChatBar with focused state by default
 * - Responsive layout with sidebar collapse support
 * - Prompt buttons on cards trigger chat interactions
 */

import { useState, useCallback } from 'react'
import { SidebarProvider, SidebarInset, useSidebar } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import DashboardV4 from '@/components/pages/DashboardV4'
import Reports from '@/components/pages/Reports'
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
        return <Reports initialTab={initialReportsTab} onInitialTabUsed={onReportsTabUsed} />
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
      <SidebarInset className={`flex-1 relative ${currentPage === '/reports' ? 'bg-[var(--color-neutral-g-50)]' : 'bg-white'}`}>
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

export default function DashboardV4Demo() {
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
