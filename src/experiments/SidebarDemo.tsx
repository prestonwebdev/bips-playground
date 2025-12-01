import { useState } from 'react'
import { SidebarProvider, SidebarInset, useSidebar } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import Overview from '@/components/pages/Overview'
import Transactions from '@/components/pages/Transactions'
import LinkedAccounts from '@/components/pages/LinkedAccounts'
import ChatBar from '@/components/ChatBar'

// Sidebar widths matching sidebar.tsx
const SIDEBAR_WIDTH_EXPANDED = 324 // 324px
const SIDEBAR_WIDTH_COLLAPSED = 80 // 80px

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
        return <Overview />
      case '/transactions':
        return <Transactions />
      case '/linked-accounts':
        return <LinkedAccounts />
      default:
        return <Overview />
    }
  }

  return (
    <>
      <AppSidebar activePage={currentPage} onPageChange={onPageChange} />
      <SidebarInset className="flex-1">
        <div className="flex-1 overflow-auto bg-[#FAFAFA] pb-32">
          {renderPage()}
        </div>
      </SidebarInset>
      <ChatBar contentOffset={sidebarWidth} />
    </>
  )
}

export default function SidebarDemo() {
  const [currentPage, setCurrentPage] = useState('/overview')

  return (
    <SidebarProvider>
      <DashboardContent currentPage={currentPage} onPageChange={setCurrentPage} />
    </SidebarProvider>
  )
}
