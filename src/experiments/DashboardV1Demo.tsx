import { useState } from 'react'
import { SidebarProvider, SidebarInset, useSidebar } from '@/components/ui/sidebar'
import { AppSidebar, v1NavItems } from '@/components/AppSidebar'
import DashboardV1 from '@/components/pages/DashboardV1'
import Transactions from '@/components/pages/Transactions'
import ChatBar from '@/components/ChatBar'

// Sidebar widths matching sidebar.tsx
const SIDEBAR_WIDTH_EXPANDED = 324
const SIDEBAR_WIDTH_COLLAPSED = 80

/**
 * Placeholder page for V1 accounts
 */
function AccountsPlaceholder() {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-lg text-[var(--color-neutral-n-500)] font-['Poppins']">
        The accounts page will be here.
      </p>
    </div>
  )
}

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
        return <DashboardV1 />
      case '/transactions':
        return <Transactions />
      case '/accounts':
        return <AccountsPlaceholder />
      default:
        return <DashboardV1 />
    }
  }

  return (
    <>
      <AppSidebar activePage={currentPage} onPageChange={onPageChange} navItems={v1NavItems} />
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
