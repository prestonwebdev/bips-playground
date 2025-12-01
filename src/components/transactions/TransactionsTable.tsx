import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Transaction,
  mockTransactions,
  mockAccounts,
  mockCategories,
  getCategoryById,
} from '@/lib/transactions-data'
import { TransactionFilters, FilterState, ColumnVisibility, CategoryDisplayMode } from './TransactionFilters'
import { TransactionRow } from './TransactionRow'
import { BulkActionsHeader } from './BulkActionsHeader'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

export type SortField = 'date' | 'merchant' | 'amount' | 'category'
export type SortDirection = 'asc' | 'desc'

interface TransactionsTableProps {
  initialTransactions?: Transaction[]
}

export function TransactionsTable({ initialTransactions }: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(
    initialTransactions ?? mockTransactions
  )
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dateRange: { from: undefined, to: undefined },
    accounts: [],
    categories: [],
    status: [],
    amountRange: { min: undefined, max: undefined },
  })
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)

  // Settings state - status column removed (all transactions are posted)
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    date: true,
    merchant: true,
    account: true,
    category: true,
    amount: true,
    status: false,
  })
  const [categoryDisplayMode, setCategoryDisplayMode] = useState<CategoryDisplayMode>('emoji')

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      if (txn.isDeleted) return false

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesMerchant = txn.merchant.toLowerCase().includes(searchLower)
        const matchesDescription = txn.description.toLowerCase().includes(searchLower)
        const matchesNotes = txn.notes.toLowerCase().includes(searchLower)
        if (!matchesMerchant && !matchesDescription && !matchesNotes) return false
      }

      // Date range filter
      if (filters.dateRange.from) {
        const txnDate = new Date(txn.date)
        if (txnDate < filters.dateRange.from) return false
      }
      if (filters.dateRange.to) {
        const txnDate = new Date(txn.date)
        if (txnDate > filters.dateRange.to) return false
      }

      // Account filter
      if (filters.accounts.length > 0 && !filters.accounts.includes(txn.accountId)) {
        return false
      }

      // Category filter
      if (filters.categories.length > 0) {
        const txnCategoryId = txn.categoryId ?? 'cat_uncategorized'
        if (!filters.categories.includes(txnCategoryId)) return false
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(txn.status)) {
        return false
      }

      // Amount range filter
      if (filters.amountRange.min !== undefined && txn.amount > -filters.amountRange.min) {
        return false
      }
      if (filters.amountRange.max !== undefined && txn.amount < -filters.amountRange.max) {
        return false
      }

      return true
    })
  }, [transactions, filters])

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'merchant':
          comparison = a.merchant.localeCompare(b.merchant)
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'category':
          const catA = getCategoryById(a.categoryId)?.name ?? 'Uncategorized'
          const catB = getCategoryById(b.categoryId)?.name ?? 'Uncategorized'
          comparison = catA.localeCompare(catB)
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
    return sorted
  }, [filteredTransactions, sortField, sortDirection])

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(sortedTransactions.map(t => t.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean, index: number, shiftKey: boolean) => {
    const newSelected = new Set(selectedIds)

    if (shiftKey && lastSelectedIndex !== null) {
      // Shift-click: select range
      const start = Math.min(lastSelectedIndex, index)
      const end = Math.max(lastSelectedIndex, index)
      for (let i = start; i <= end; i++) {
        newSelected.add(sortedTransactions[i].id)
      }
    } else {
      if (checked) {
        newSelected.add(id)
      } else {
        newSelected.delete(id)
      }
    }

    setSelectedIds(newSelected)
    setLastSelectedIndex(index)
  }

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Transaction update handlers
  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(txn =>
        txn.id === id
          ? { ...txn, ...updates, updatedAt: new Date().toISOString() }
          : txn
      )
    )
  }

  const deleteTransaction = (id: string) => {
    updateTransaction(id, { isDeleted: true })
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  // Bulk action handlers
  const handleBulkCategoryChange = (categoryId: string) => {
    setTransactions(prev =>
      prev.map(txn =>
        selectedIds.has(txn.id)
          ? { ...txn, categoryId, categorySource: 'manual' as const, updatedAt: new Date().toISOString() }
          : txn
      )
    )
    setSelectedIds(new Set())
  }

  const handleBulkDelete = () => {
    setTransactions(prev =>
      prev.map(txn =>
        selectedIds.has(txn.id)
          ? { ...txn, isDeleted: true, updatedAt: new Date().toISOString() }
          : txn
      )
    )
    setSelectedIds(new Set())
  }

  const handleClearSelection = () => {
    setSelectedIds(new Set())
  }

  const isAllSelected = sortedTransactions.length > 0 && selectedIds.size === sortedTransactions.length

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-4 w-4 text-[var(--color-neutral-n-400)]" />
    return sortDirection === 'asc'
      ? <ArrowUp className="ml-1 h-4 w-4" />
      : <ArrowDown className="ml-1 h-4 w-4" />
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <TransactionFilters
        filters={filters}
        onFiltersChange={setFilters}
        accounts={mockAccounts}
        categories={mockCategories}
        transactionCount={sortedTransactions.length}
        totalCount={transactions.filter(t => !t.isDeleted).length}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        categoryDisplayMode={categoryDisplayMode}
        onCategoryDisplayModeChange={setCategoryDisplayMode}
      />

      {/* Table */}
      <div className="rounded-[16px] border border-[#f1f2f2] bg-white overflow-hidden">
        <Table>
          <TableHeader>
            {selectedIds.size > 0 ? (
              <BulkActionsHeader
                selectedCount={selectedIds.size}
                totalCount={sortedTransactions.length}
                categories={mockCategories}
                onCategoryChange={handleBulkCategoryChange}
                onDelete={handleBulkDelete}
                onClearSelection={handleClearSelection}
                onSelectAll={() => handleSelectAll(true)}
                isAllSelected={isAllSelected}
                columnVisibility={columnVisibility}
                categoryDisplayMode={categoryDisplayMode}
              />
            ) : (
              <TableRow className="bg-[#fafafa] hover:bg-[#fafafa]">
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                {columnVisibility.date && (
                  <TableHead
                    className="cursor-pointer select-none font-['Poppins'] font-medium text-[var(--color-neutral-n-600)]"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Date
                      <SortIcon field="date" />
                    </div>
                  </TableHead>
                )}
                {columnVisibility.merchant && (
                  <TableHead
                    className="cursor-pointer select-none font-['Poppins'] font-medium text-[var(--color-neutral-n-600)]"
                    onClick={() => handleSort('merchant')}
                  >
                    <div className="flex items-center">
                      Merchant
                      <SortIcon field="merchant" />
                    </div>
                  </TableHead>
                )}
                {columnVisibility.account && (
                  <TableHead className="font-['Poppins'] font-medium text-[var(--color-neutral-n-600)]">
                    Account
                  </TableHead>
                )}
                {columnVisibility.category && (
                  <TableHead
                    className="cursor-pointer select-none font-['Poppins'] font-medium text-[var(--color-neutral-n-600)]"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center">
                      Category
                      <SortIcon field="category" />
                    </div>
                  </TableHead>
                )}
                {columnVisibility.amount && (
                  <TableHead
                    className="cursor-pointer select-none text-right font-['Poppins'] font-medium text-[var(--color-neutral-n-600)]"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center justify-end">
                      Amount
                      <SortIcon field="amount" />
                    </div>
                  </TableHead>
                )}
                {columnVisibility.status && (
                  <TableHead className="font-['Poppins'] font-medium text-[var(--color-neutral-n-600)]">
                    Status
                  </TableHead>
                )}
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            )}
          </TableHeader>
          <TableBody>
            {sortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={Object.values(columnVisibility).filter(Boolean).length + 2} className="h-24 text-center text-[var(--color-neutral-n-600)] font-['Poppins']">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              sortedTransactions.map((transaction, index) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  index={index}
                  isSelected={selectedIds.has(transaction.id)}
                  onSelect={handleSelectOne}
                  onUpdate={updateTransaction}
                  onDelete={deleteTransaction}
                  categories={mockCategories}
                  columnVisibility={columnVisibility}
                  categoryDisplayMode={categoryDisplayMode}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
