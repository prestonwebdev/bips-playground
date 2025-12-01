import { TransactionsTable } from '@/components/transactions'

export default function Transactions() {
  return (
    <div className="p-6 bg-[#FAFAFA] min-h-screen">
      <div className="bg-white rounded-[24px] shadow-[0px_2px_8px_rgba(0,0,0,0.04)] p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[24px] font-semibold text-[var(--color-neutral-n-800)] font-['Poppins']">
            Transactions
          </h1>
          <p className="text-[var(--color-neutral-n-600)] font-['Poppins'] text-sm mt-1">
            View, categorize, and manage your transactions
          </p>
        </div>

        {/* Transactions Table */}
        <TransactionsTable />
      </div>
    </div>
  )
}
