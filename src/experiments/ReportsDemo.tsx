/**
 * ReportsDemo - Demo wrapper for Reports page
 *
 * Features:
 * - Sidebar navigation with page switching
 * - Responsive layout with sidebar collapse support
 */

import { useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import DashboardV1 from '@/components/pages/DashboardV1'
import DashboardV2 from '@/components/pages/DashboardV2'
import DashboardV3 from '@/components/pages/DashboardV3'
import DashboardV4 from '@/components/pages/DashboardV4'
import Reports from '@/components/pages/Reports'
import Transactions from '@/components/pages/Transactions'
import LinkedAccounts from '@/components/pages/LinkedAccounts'

function ReportsContent({ currentPage, onPageChange }: { currentPage: string; onPageChange: (page: string) => void }) {
  const renderPage = () => {
    switch (currentPage) {
      case '/reports':
        return <Reports />
      case '/overview':
      case '/overview-v2':
        return <DashboardV2 />
      case '/overview-v1':
        return <DashboardV1 />
      case '/overview-v3':
        return <DashboardV3 />
      case '/overview-v4':
        return <DashboardV4 />
      case '/transactions':
        return <Transactions />
      case '/linked-accounts':
        return <LinkedAccounts />
      default:
        return <Reports />
    }
  }

  return (
    <>
      <AppSidebar activePage={currentPage} onPageChange={onPageChange} />
      <SidebarInset className="flex-1">
        <div className="flex-1 overflow-auto bg-[var(--color-neutral-g-50)] pb-24 pt-10 px-12">
          {renderPage()}
        </div>
      </SidebarInset>
    </>
  )
}

export default function ReportsDemo() {
  const [currentPage, setCurrentPage] = useState('/reports')

  return (
    <SidebarProvider>
      <ReportsContent currentPage={currentPage} onPageChange={setCurrentPage} />
    </SidebarProvider>
  )
}
