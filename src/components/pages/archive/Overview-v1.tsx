import { MetricCard } from '@/components/overview/MetricCard'
import { DateRangeSelector } from '@/components/overview/DateRangeSelector'
import { PerformanceChart } from '@/components/overview/PerformanceChart'
import { SpendingList } from '@/components/overview/SpendingList'
import { ActionButton } from '@/components/overview/ActionButton'
import { FileText, CreditCard, Sparkles } from 'lucide-react'
import { mockFinancialData, formatCurrency } from '@/lib/mock-data'

export default function Overview() {
  const { summary, performanceData, spendingData } = mockFinancialData

  return (
    <div className="p-6 bg-[#FAFAFA] min-h-screen">
      {/* Main Dashboard Card */}
      <div className="bg-white rounded-[24px] shadow-[0px_2px_8px_rgba(0,0,0,0.04)] p-8 space-y-6">
        {/* Header with Date Selector */}
        <div className="flex items-center justify-between">
          <DateRangeSelector />
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Revenue"
            value={formatCurrency(summary.revenue)}
            onTellMeMore={() => console.log('Tell me more about revenue')}
          />
          <MetricCard
            label="Costs"
            value={formatCurrency(summary.costs)}
            onTellMeMore={() => console.log('Tell me more about costs')}
          />
          <MetricCard
            label="Cash on Hand"
            value={formatCurrency(summary.cashOnHand)}
            onTellMeMore={() => console.log('Tell me more about cash')}
          />
        </div>

        {/* Performance Chart and Spending List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Performance Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <PerformanceChart data={performanceData} />
          </div>

          {/* Spending List - Takes 1 column */}
          <div className="lg:col-span-1">
            <SpendingList items={spendingData} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <ActionButton
            icon={FileText}
            label="Generate P&L Report"
            onClick={() => console.log('Generate P&L Report')}
          />
          <ActionButton
            icon={CreditCard}
            label={`Review ${summary.uncategorizedTransactions} Uncategorized Transactions`}
            onClick={() => console.log('Review transactions')}
            showBadge
          />
          <ActionButton
            icon={Sparkles}
            label="View Insights"
            onClick={() => console.log('View insights')}
          />
        </div>
      </div>
    </div>
  )
}
