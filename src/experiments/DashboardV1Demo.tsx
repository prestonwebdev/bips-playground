import { useState } from 'react'
import { SidebarProvider, SidebarInset, useSidebar } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import DashboardV1 from '@/components/pages/DashboardV1'
import Transactions from '@/components/pages/Transactions'
import LinkedAccounts from '@/components/pages/LinkedAccounts'
import ChatBar from '@/components/ChatBar'

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
      case '/overview-v1':
        return <DashboardV1 />
      case '/transactions':
        return <Transactions />
      case '/linked-accounts':
        return <LinkedAccounts />
      default:
        return <DashboardV1 />
    }
  }

  return (
    <>
      <AppSidebar activePage={currentPage} onPageChange={onPageChange} />
      <SidebarInset className="flex-1">
        <div className="flex-1 overflow-auto bg-[var(--color-neutral-g-50)] pb-32 pt-10 px-12">
          {renderPage()}
        </div>
      </SidebarInset>
      <ChatBar contentOffset={sidebarWidth} />
    </>
  )
}

export default function DashboardV1Demo() {
  const [currentPage, setCurrentPage] = useState('/overview')

  return (
    <SidebarProvider>
      <DashboardContent currentPage={currentPage} onPageChange={setCurrentPage} />
    </SidebarProvider>
  )
}
