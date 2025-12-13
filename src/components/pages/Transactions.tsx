/**
 * Transactions Page
 *
 * Features:
 * - Sticky filter header with search, account/category filters, and transaction count
 * - Table with sortable columns
 * - Category pills with icons
 * - Hide/unhide transactions directly in the row
 * - Proper scroll fade effect
 */

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
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Transaction,
  mockTransactions,
  mockAccounts,
  mockCategories,
  Category,
  getCategoryById,
  getAccountById,
  formatDate,
} from '@/lib/transactions-data'
import { ScrollFadeEffect } from '@/components/ui/scroll-fade-effect'
import { IconButton } from '@/components/ui/icon-button'
import {
  Search,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  EyeOff,
  Check,
  X,
  DollarSign,
  CreditCard,
  Megaphone,
  Briefcase,
  Plane,
  UtensilsCrossed,
  Monitor,
  Wrench,
  Zap,
  Shield,
  HelpCircle,
  RotateCcw,
  Home,
  ArrowLeftRight,
  User,
  Landmark,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type SortField = 'date' | 'merchant' | 'amount'
type SortDirection = 'asc' | 'desc'

// Map category IDs to icons
const categoryIcons: Record<string, LucideIcon> = {
  'cat_1': DollarSign,      // Payroll
  'cat_2': Monitor,         // Software & SaaS
  'cat_3': Megaphone,       // Marketing
  'cat_4': Briefcase,       // Office Supplies
  'cat_5': Plane,           // Travel
  'cat_6': UtensilsCrossed, // Meals & Entertainment
  'cat_7': Briefcase,       // Professional Services
  'cat_8': Wrench,          // Equipment
  'cat_9': Zap,             // Utilities
  'cat_10': Shield,         // Insurance
  'cat_11': DollarSign,     // Income
  'cat_12': RotateCcw,      // Refund
  'cat_uncategorized': HelpCircle,
  'cat_personal': Home,
  'cat_cc_payment': CreditCard,
  'cat_internal': ArrowLeftRight,
  'cat_owner_draw': User,
  'cat_loan': Landmark,
}

function getCategoryIcon(categoryId: string | null): LucideIcon {
  if (!categoryId) return HelpCircle
  return categoryIcons[categoryId] || HelpCircle
}

// Format currency with proper sign and color
function formatAmount(amount: number): { text: string; isPositive: boolean } {
  const absAmount = Math.abs(amount)
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(absAmount)

  if (amount >= 0) {
    return { text: `+${formatted}`, isPositive: true }
  }
  return { text: `-${formatted}`, isPositive: false }
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      if (txn.isDeleted) return false

      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const matchesMerchant = txn.merchant.toLowerCase().includes(searchLower)
        const matchesDescription = txn.description.toLowerCase().includes(searchLower)
        const matchesNotes = txn.notes.toLowerCase().includes(searchLower)
        if (!matchesMerchant && !matchesDescription && !matchesNotes) return false
      }

      // Account filter
      if (selectedAccounts.length > 0 && !selectedAccounts.includes(txn.accountId)) {
        return false
      }

      // Category filter
      if (selectedCategories.length > 0) {
        const txnCategoryId = txn.categoryId ?? 'cat_uncategorized'
        if (!selectedCategories.includes(txnCategoryId)) return false
      }

      return true
    })
  }, [transactions, searchQuery, selectedAccounts, selectedCategories])

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
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
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredTransactions, sortField, sortDirection])

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(sortedTransactions.map(t => t.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
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

  // Toggle hidden
  const handleToggleHidden = (id: string) => {
    setTransactions(prev =>
      prev.map(txn =>
        txn.id === id
          ? { ...txn, isHidden: !txn.isHidden, updatedAt: new Date().toISOString() }
          : txn
      )
    )
  }

  // Update category
  const handleCategoryChange = (id: string, categoryId: string) => {
    setTransactions(prev =>
      prev.map(txn =>
        txn.id === id
          ? { ...txn, categoryId, categorySource: 'manual' as const, updatedAt: new Date().toISOString() }
          : txn
      )
    )
  }

  // Bulk category change
  const handleBulkCategoryChange = (categoryId: string) => {
    setTransactions(prev =>
      prev.map(txn =>
        selectedIds.has(txn.id)
          ? { ...txn, categoryId, categorySource: 'manual' as const, updatedAt: new Date().toISOString() }
          : txn
      )
    )
  }

  // Bulk hide
  const handleBulkHide = () => {
    setTransactions(prev =>
      prev.map(txn =>
        selectedIds.has(txn.id)
          ? { ...txn, isHidden: true, updatedAt: new Date().toISOString() }
          : txn
      )
    )
    setSelectedIds(new Set())
  }

  // Deselect all
  const handleDeselectAll = () => {
    setSelectedIds(new Set())
  }

  const isAllSelected = sortedTransactions.length > 0 && selectedIds.size === sortedTransactions.length
  const hasSelection = selectedIds.size > 0

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-4 w-4 text-[var(--color-neutral-n-400)]" />
    return sortDirection === 'asc'
      ? <ArrowUp className="ml-1 h-4 w-4" />
      : <ArrowDown className="ml-1 h-4 w-4" />
  }

  // Get visible business categories (non-hidden)
  const visibleCategories = mockCategories.filter(c => !c.isHidden)

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Fixed Filter Header */}
      <div className="shrink-0 bg-white px-6 pt-6 pb-4 border-b border-[var(--color-neutral-g-100)]">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-neutral-n-400)]" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 h-10 rounded-full border-[var(--color-neutral-g-200)] bg-white font-['Poppins'] text-[14px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-n-400)] hover:text-[var(--color-neutral-n-600)]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Account Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 h-10 rounded-full border border-[var(--color-neutral-g-200)] bg-white text-[14px] font-['Poppins'] text-[var(--color-neutral-n-700)] hover:bg-[var(--color-neutral-g-50)] transition-colors">
                  Account
                  {selectedAccounts.length > 0 && (
                    <span className="bg-[var(--color-primary-p-500)] text-white text-[11px] px-1.5 py-0.5 rounded-full">
                      {selectedAccounts.length}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[240px] p-2">
                {mockAccounts.map((account) => (
                  <DropdownMenuItem
                    key={account.id}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault()
                      if (selectedAccounts.includes(account.id)) {
                        setSelectedAccounts(prev => prev.filter(id => id !== account.id))
                      } else {
                        setSelectedAccounts(prev => [...prev, account.id])
                      }
                    }}
                  >
                    <Checkbox
                      checked={selectedAccounts.includes(account.id)}
                      className="pointer-events-none"
                    />
                    <span className="text-[14px] font-['Poppins']">
                      {account.institution} ••{account.lastFour}
                    </span>
                  </DropdownMenuItem>
                ))}
                {selectedAccounts.length > 0 && (
                  <DropdownMenuItem
                    className="flex items-center justify-center gap-1 px-3 py-2 mt-1 border-t border-[var(--color-neutral-g-100)] text-[var(--color-neutral-n-500)] cursor-pointer"
                    onClick={() => setSelectedAccounts([])}
                  >
                    <X className="h-3 w-3" />
                    Clear filter
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Category Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 h-10 rounded-full border border-[var(--color-neutral-g-200)] bg-white text-[14px] font-['Poppins'] text-[var(--color-neutral-n-700)] hover:bg-[var(--color-neutral-g-50)] transition-colors">
                  Category
                  {selectedCategories.length > 0 && (
                    <span className="bg-[var(--color-primary-p-500)] text-white text-[11px] px-1.5 py-0.5 rounded-full">
                      {selectedCategories.length}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[240px] p-2 max-h-[320px] overflow-y-auto">
                {visibleCategories.map((category) => {
                  const CatIcon = getCategoryIcon(category.id)
                  return (
                    <DropdownMenuItem
                      key={category.id}
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault()
                        if (selectedCategories.includes(category.id)) {
                          setSelectedCategories(prev => prev.filter(id => id !== category.id))
                        } else {
                          setSelectedCategories(prev => [...prev, category.id])
                        }
                      }}
                    >
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        className="pointer-events-none"
                      />
                      <CatIcon className="h-4 w-4 text-[var(--color-neutral-n-600)]" />
                      <span className="text-[14px] font-['Poppins']">{category.name}</span>
                    </DropdownMenuItem>
                  )
                })}
                {selectedCategories.length > 0 && (
                  <DropdownMenuItem
                    className="flex items-center justify-center gap-1 px-3 py-2 mt-1 border-t border-[var(--color-neutral-g-100)] text-[var(--color-neutral-n-500)] cursor-pointer"
                    onClick={() => setSelectedCategories([])}
                  >
                    <X className="h-3 w-3" />
                    Clear filter
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Transaction Count */}
            <span className="text-[14px] text-[var(--color-neutral-n-600)] font-['Poppins']">
              {sortedTransactions.length} Transaction{sortedTransactions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable Table Content */}
      <ScrollFadeEffect className="flex-1 min-h-0" fadeColor="white">
        <div className="px-6 pt-6 pb-56">
          <div className="max-w-[1800px] mx-auto">
            <div className="bg-white rounded-[16px] border border-[var(--color-neutral-g-100)] overflow-hidden">
            <Table>
              <TableHeader>
                {/* Bulk Selection Header - Shows when items are selected */}
                {hasSelection && (
                  <TableRow className="bg-white hover:bg-white border-b border-[var(--color-neutral-g-200)]">
                    <TableHead colSpan={7} className="p-0">
                      <div className="flex items-center h-[59px] px-4">
                        <div className="flex items-center gap-2.5 flex-1">
                          <CreditCard className="h-5 w-5 text-[var(--color-neutral-n-800)]" />
                          <span className="font-['Poppins'] font-medium text-[14px] text-[var(--color-neutral-n-800)]">
                            {selectedIds.size} Transaction{selectedIds.size !== 1 ? 's' : ''} Selected
                          </span>
                          <button
                            onClick={handleDeselectAll}
                            className="font-['Poppins'] text-[13px] text-[var(--color-neutral-n-700)] underline hover:text-[var(--color-neutral-n-800)]"
                          >
                            Deselect
                          </button>
                        </div>
                        <span className="font-['Poppins'] font-medium text-[14px] text-[var(--color-neutral-n-600)] mr-3">
                          Bulk Edit
                        </span>
                        <div className="flex items-center gap-3">
                          {/* Bulk Category Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[var(--color-neutral-g-100)] text-[14px] font-['Poppins'] text-[var(--color-neutral-n-800)] hover:bg-[var(--color-neutral-g-50)] transition-colors shadow-[0px_2px_4px_0px_rgba(70,81,83,0.01),0px_7px_7px_0px_rgba(70,81,83,0.01)]">
                                Category
                                <ChevronDown className="h-6 w-6" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[240px] p-2 max-h-[320px] overflow-y-auto">
                              {visibleCategories.map((category) => {
                                const CatIcon = getCategoryIcon(category.id)
                                return (
                                  <DropdownMenuItem
                                    key={category.id}
                                    className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                                    onClick={() => handleBulkCategoryChange(category.id)}
                                  >
                                    <CatIcon className="h-4 w-4 text-[var(--color-neutral-n-600)]" />
                                    <span className="text-[14px] font-['Poppins']">{category.name}</span>
                                  </DropdownMenuItem>
                                )
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {/* Bulk Hide Button */}
                          <button
                            onClick={handleBulkHide}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[var(--color-neutral-g-100)] text-[14px] font-['Poppins'] text-[var(--color-neutral-n-800)] hover:bg-[var(--color-neutral-g-50)] transition-colors shadow-[0px_2px_4px_0px_rgba(70,81,83,0.01),0px_7px_7px_0px_rgba(70,81,83,0.01)]"
                          >
                            Hide
                            <EyeOff className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </TableHead>
                  </TableRow>
                )}
                {/* Column Headers */}
                <TableRow className="bg-white hover:bg-white border-b border-[var(--color-neutral-g-200)]">
                  <TableHead className="w-[64px] pl-4">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none font-['Poppins'] font-medium text-[var(--color-neutral-n-800)] text-[14px] w-[171px]"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center justify-between">
                      Date
                      <SortIcon field="date" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none font-['Poppins'] font-medium text-[var(--color-neutral-n-800)] text-[14px] w-[241px]"
                    onClick={() => handleSort('merchant')}
                  >
                    <div className="flex items-center justify-between">
                      Description
                      <SortIcon field="merchant" />
                    </div>
                  </TableHead>
                  <TableHead className="font-['Poppins'] font-medium text-[var(--color-neutral-n-800)] text-[14px] w-[165px]">
                    <div className="flex items-center justify-between">
                      Account
                      <ArrowUpDown className="h-5 w-5 text-[var(--color-neutral-n-400)]" />
                    </div>
                  </TableHead>
                  <TableHead className="font-['Poppins'] font-medium text-[var(--color-neutral-n-800)] text-[14px] w-[275px]">
                    <div className="flex items-center justify-between">
                      Category
                      <ArrowUpDown className="h-5 w-5 text-[var(--color-neutral-n-400)]" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none font-['Poppins'] font-medium text-[var(--color-neutral-n-800)] text-[14px] w-[181px]"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center justify-between">
                      Amount
                      <SortIcon field="amount" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-[var(--color-neutral-n-600)] font-['Poppins']">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTransactions.map((transaction) => {
                    const account = getAccountById(transaction.accountId)
                    const category = getCategoryById(transaction.categoryId)
                    const CategoryIcon = getCategoryIcon(transaction.categoryId)
                    const { text: amountText, isPositive } = formatAmount(transaction.amount)
                    const isSelected = selectedIds.has(transaction.id)
                    const isHiddenCategory = category?.isHidden ?? false
                    const isHiddenRow = transaction.isHidden || isHiddenCategory

                    return (
                      <TableRow
                        key={transaction.id}
                        className={`
                          h-[64px] transition-colors group
                          ${isSelected ? 'bg-white' : ''}
                          ${isHiddenRow ? 'bg-[var(--color-neutral-g-50)]' : 'hover:bg-[var(--color-neutral-g-50)]'}
                        `}
                      >
                        {/* Checkbox */}
                        <TableCell className="pl-4 w-[64px]">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectOne(transaction.id, !!checked)}
                            aria-label={`Select transaction from ${transaction.merchant}`}
                          />
                        </TableCell>

                        {/* Date */}
                        <TableCell className={`font-['Poppins'] font-medium text-[14px] w-[165px] ${isHiddenRow ? 'text-[var(--color-neutral-n-600)]' : 'text-[var(--color-neutral-n-800)]'}`}>
                          {formatDate(transaction.date)}
                        </TableCell>

                        {/* Description (includes merchant info) */}
                        <TableCell className="font-['Poppins'] text-[14px] text-[var(--color-neutral-n-600)] w-[233px]">
                          {transaction.description}
                        </TableCell>

                        {/* Account */}
                        <TableCell className="font-['Poppins'] font-medium text-[14px] text-[var(--color-neutral-n-600)] w-[165px]">
                          {account ? `${account.institution} **${account.lastFour}` : 'Unknown'}
                        </TableCell>

                        {/* Category - Pill with Icon */}
                        <TableCell className="w-[280px]">
                          <CategoryPill
                            category={category}
                            categoryId={transaction.categoryId}
                            Icon={CategoryIcon}
                            categories={mockCategories}
                            onCategoryChange={(catId) => handleCategoryChange(transaction.id, catId)}
                          />
                        </TableCell>

                        {/* Amount */}
                        <TableCell className={`font-['Poppins'] text-[14px] font-semibold w-[137px] ${
                          isHiddenRow ? 'text-[var(--color-neutral-n-600)]' : isPositive ? 'text-[var(--color-primary-p-500)]' : 'text-[#976d4c]'
                        }`}>
                          {amountText}
                        </TableCell>

                        {/* Hide/Unhide Icon - Only visible on hover */}
                        <TableCell className="pr-4">
                          <IconButton
                            onClick={() => handleToggleHidden(transaction.id)}
                            className="opacity-0 group-hover:opacity-100"
                            title={transaction.isHidden ? 'Show in reports' : 'Hide from reports'}
                            size="md"
                          >
                            <EyeOff className="h-4 w-4" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </ScrollFadeEffect>
  </div>
  )
}

/**
 * Category Pill Component - Shows category with icon in a pill shape
 */
interface CategoryPillProps {
  category: Category | undefined
  categoryId: string | null
  Icon: LucideIcon
  categories: Category[]
  onCategoryChange: (categoryId: string) => void
}

function CategoryPill({ category, categoryId, Icon, categories, onCategoryChange }: CategoryPillProps) {
  const [isOpen, setIsOpen] = useState(false)

  const visibleCategories = categories.filter(c => !c.isHidden)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-1 rounded-full bg-white border border-[var(--color-neutral-g-200)] hover:bg-[var(--color-neutral-g-50)] transition-colors shadow-[0px_2px_4px_0px_rgba(70,81,83,0.01),0px_7px_7px_0px_rgba(70,81,83,0.01)] whitespace-nowrap">
          <Icon className="h-4 w-4 text-[var(--color-neutral-n-600)] shrink-0" />
          <span className="text-[14px] font-['Poppins'] text-[var(--color-neutral-n-700)]">
            {category?.name ?? 'Uncategorized'}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-2" align="start">
        <div className="space-y-1 max-h-[280px] overflow-y-auto">
          {visibleCategories.map((cat) => {
            const CatIcon = getCategoryIcon(cat.id)
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onCategoryChange(cat.id)
                  setIsOpen(false)
                }}
                className={`
                  w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left
                  hover:bg-[var(--color-neutral-g-50)] transition-colors
                  ${categoryId === cat.id ? 'bg-[var(--color-primary-p-50)]' : ''}
                `}
              >
                <CatIcon className="h-4 w-4 text-[var(--color-neutral-n-600)]" />
                <span className="text-[13px] font-['Poppins'] flex-1">{cat.name}</span>
                {categoryId === cat.id && (
                  <Check className="h-4 w-4 text-[var(--color-primary-p-500)]" />
                )}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
