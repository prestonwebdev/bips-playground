/**
 * DashboardV4Demo - Demo wrapper for DashboardV4
 *
 * Features:
 * - Sidebar navigation with page switching
 * - ChatBar with focused state by default
 * - Responsive layout with sidebar collapse support
 */

import { useState } from 'react'
import { SidebarProvider, SidebarInset, useSidebar } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import DashboardV1 from '@/components/pages/DashboardV1'
import DashboardV2 from '@/components/pages/DashboardV2'
import DashboardV3 from '@/components/pages/DashboardV3'
import DashboardV4 from '@/components/pages/DashboardV4'
import Reports from '@/components/pages/Reports'
import Transactions from '@/components/pages/Transactions'
import LinkedAccounts from '@/components/pages/LinkedAccounts'
import ChatBar from '@/components/ChatBar'
import { UnicornAnimation } from '@/components/UnicornAnimation'

// Sidebar widths matching sidebar.tsx
const SIDEBAR_WIDTH_EXPANDED = 324
const SIDEBAR_WIDTH_COLLAPSED = 80

interface DashboardContentProps {
  currentPage: string
  onPageChange: (page: string) => void
}

function DashboardContent({ currentPage, onPageChange }: DashboardContentProps) {
  const { state } = useSidebar()

  const sidebarWidth = state === 'expanded' ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED

  const renderPage = () => {
    switch (currentPage) {
      case '/overview':
      case '/overview-v4':
        return <DashboardV4 />
      case '/overview-v1':
        return <DashboardV1 />
      case '/overview-v2':
        return <DashboardV2 />
      case '/overview-v3':
        return <DashboardV3 />
      case '/reports':
        return <Reports />
      case '/transactions':
        return <Transactions />
      case '/linked-accounts':
        return <LinkedAccounts />
      default:
        return <DashboardV4 />
    }
  }

  const isV4Page = currentPage === '/overview' || currentPage === '/overview-v4'

  return (
    <>
      <AppSidebar activePage={currentPage} onPageChange={onPageChange} sidebarBg="gray" />
      <SidebarInset className="flex-1 relative">
        {/* Unicorn Animation - Full size background, only on V4 */}
        {isV4Page && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <UnicornAnimation
              projectId="7lQajH71KPzS88qL2ky2"
              width="100%"
              height="100%"
            />
          </div>
        )}
        <div className="flex-1 overflow-auto bg-transparent pb-56 px-12 relative z-10 flex flex-col justify-center">
          {renderPage()}
        </div>
      </SidebarInset>
      <ChatBar contentOffset={sidebarWidth} defaultFocused />
    </>
  )
}

export default function DashboardV4Demo() {
  const [currentPage, setCurrentPage] = useState('/overview')

  return (
    <SidebarProvider>
      <DashboardContent currentPage={currentPage} onPageChange={setCurrentPage} />
    </SidebarProvider>
  )
}
