import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Account, Category, TransactionStatus } from '@/lib/transactions-data'
import { Search, X, SlidersHorizontal, Settings } from 'lucide-react'

export interface FilterState {
  search: string
  dateRange: { from: Date | undefined; to: Date | undefined }
  accounts: string[]
  categories: string[]
  status: TransactionStatus[]
  amountRange: { min: number | undefined; max: number | undefined }
}

export type ColumnKey = 'date' | 'merchant' | 'account' | 'category' | 'amount' | 'status'

export interface ColumnVisibility {
  date: boolean
  merchant: boolean
  account: boolean
  category: boolean
  amount: boolean
  status: boolean
}

export type CategoryDisplayMode = 'emoji' | 'color'

interface TransactionFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  accounts: Account[]
  categories: Category[]
  transactionCount: number
  totalCount: number
  columnVisibility: ColumnVisibility
  onColumnVisibilityChange: (visibility: ColumnVisibility) => void
  categoryDisplayMode: CategoryDisplayMode
  onCategoryDisplayModeChange: (mode: CategoryDisplayMode) => void
}

export function TransactionFilters({
  filters,
  onFiltersChange,
  accounts,
  categories,
  transactionCount,
  columnVisibility,
  onColumnVisibilityChange,
  categoryDisplayMode,
  onCategoryDisplayModeChange,
}: TransactionFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      dateRange: { from: undefined, to: undefined },
      accounts: [],
      categories: [],
      status: [],
      amountRange: { min: undefined, max: undefined },
    })
  }

  const hasActiveFilters =
    filters.dateRange.from ||
    filters.dateRange.to ||
    filters.accounts.length > 0 ||
    filters.categories.length > 0 ||
    filters.status.length > 0 ||
    filters.amountRange.min !== undefined ||
    filters.amountRange.max !== undefined

  const activeFilterCount = [
    filters.accounts.length > 0,
    filters.categories.length > 0,
    filters.status.length > 0,
    filters.amountRange.min !== undefined || filters.amountRange.max !== undefined,
  ].filter(Boolean).length

  const columnLabels: Record<ColumnKey, string> = {
    date: 'Date',
    merchant: 'Merchant',
    account: 'Account',
    category: 'Category',
    amount: 'Amount',
    status: 'Status',
  }

  return (
    <div className="space-y-3">
      {/* Search Bar with Filters */}
      <div className="flex items-center gap-3">
        {/* Search Input with integrated filter button */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-neutral-n-400)]" />
          <Input
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9 pr-12 rounded-full border-[#f1f2f2] font-['Poppins'] h-10"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-[var(--color-neutral-n-400)] hover:text-[var(--color-neutral-n-600)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {/* Filter Toggle Button */}
          <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <PopoverTrigger asChild>
              <button
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${
                  hasActiveFilters
                    ? 'bg-[var(--color-primary-p-500)] text-white'
                    : 'hover:bg-[var(--color-neutral-g-100)] text-[var(--color-neutral-n-500)]'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[var(--color-primary-p-500)] text-white text-[10px] flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-['Poppins'] font-semibold text-[var(--color-neutral-n-800)]">Filters</h4>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs text-[var(--color-neutral-n-500)] font-['Poppins'] h-7 px-2"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Account Filter */}
                <div>
                  <p className="text-xs font-medium text-[var(--color-neutral-n-500)] mb-2 font-['Poppins']">
                    Account
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {accounts.map((account) => (
                      <label key={account.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={filters.accounts.includes(account.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFilter('accounts', [...filters.accounts, account.id])
                            } else {
                              updateFilter('accounts', filters.accounts.filter(id => id !== account.id))
                            }
                          }}
                        />
                        <span className="text-sm font-['Poppins']">
                          {account.name} ({account.lastFour})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <p className="text-xs font-medium text-[var(--color-neutral-n-500)] mb-2 font-['Poppins']">
                    Category
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={filters.categories.includes(category.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFilter('categories', [...filters.categories, category.id])
                            } else {
                              updateFilter('categories', filters.categories.filter(id => id !== category.id))
                            }
                          }}
                        />
                        {categoryDisplayMode === 'emoji' ? (
                          <span className="text-base">{category.emoji}</span>
                        ) : (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                        )}
                        <span className="text-sm font-['Poppins']">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <p className="text-xs font-medium text-[var(--color-neutral-n-500)] mb-2 font-['Poppins']">
                    Status
                  </p>
                  <div className="space-y-2">
                    {(['posted', 'pending'] as TransactionStatus[]).map((status) => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={filters.status.includes(status)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFilter('status', [...filters.status, status])
                            } else {
                              updateFilter('status', filters.status.filter(s => s !== status))
                            }
                          }}
                        />
                        <span className="text-sm font-['Poppins'] capitalize">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Amount Range Filter */}
                <div>
                  <p className="text-xs font-medium text-[var(--color-neutral-n-500)] mb-2 font-['Poppins']">
                    Amount Range
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.amountRange.min ?? ''}
                      onChange={(e) => updateFilter('amountRange', {
                        ...filters.amountRange,
                        min: e.target.value ? Number(e.target.value) : undefined
                      })}
                      className="font-['Poppins'] h-8 text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.amountRange.max ?? ''}
                      onChange={(e) => updateFilter('amountRange', {
                        ...filters.amountRange,
                        max: e.target.value ? Number(e.target.value) : undefined
                      })}
                      className="font-['Poppins'] h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Settings Button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-[var(--color-neutral-g-100)]"
            >
              <Settings className="h-5 w-5 text-[var(--color-neutral-n-500)]" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4" align="end">
            <div className="space-y-4">
              <h4 className="font-['Poppins'] font-semibold text-[var(--color-neutral-n-800)]">Settings</h4>

              {/* Column Visibility */}
              <div>
                <p className="text-xs font-medium text-[var(--color-neutral-n-500)] mb-2 font-['Poppins']">
                  Visible Columns
                </p>
                <div className="space-y-2">
                  {(Object.keys(columnVisibility) as ColumnKey[]).map((key) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={columnVisibility[key]}
                        onCheckedChange={(checked) => {
                          onColumnVisibilityChange({
                            ...columnVisibility,
                            [key]: !!checked,
                          })
                        }}
                      />
                      <span className="text-sm font-['Poppins']">{columnLabels[key]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Display Mode */}
              <div>
                <p className="text-xs font-medium text-[var(--color-neutral-n-500)] mb-2 font-['Poppins']">
                  Category Style
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onCategoryDisplayModeChange('emoji')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-['Poppins'] transition-colors ${
                      categoryDisplayMode === 'emoji'
                        ? 'bg-[var(--color-primary-p-50)] border-2 border-[var(--color-primary-p-500)] text-[var(--color-primary-p-700)]'
                        : 'border border-[#f1f2f2] hover:bg-[var(--color-neutral-g-50)]'
                    }`}
                  >
                    🍔 Emoji
                  </button>
                  <button
                    onClick={() => onCategoryDisplayModeChange('color')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-['Poppins'] transition-colors ${
                      categoryDisplayMode === 'color'
                        ? 'bg-[var(--color-primary-p-50)] border-2 border-[var(--color-primary-p-500)] text-[var(--color-primary-p-700)]'
                        : 'border border-[#f1f2f2] hover:bg-[var(--color-neutral-g-50)]'
                    }`}
                  >
                    <span className="inline-block w-3 h-3 rounded-full bg-[#E07A5F] mr-1.5 align-middle" />
                    Color
                  </button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Results count and active filter badges */}
      <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-n-600)] font-['Poppins']">
        <span>{transactionCount} Transactions</span>

        {/* Active filter badges */}
        {hasActiveFilters && (
          <>
            <span className="text-[var(--color-neutral-n-400)]">•</span>
            {filters.accounts.length > 0 && (
              <Badge
                variant="secondary"
                className="text-xs font-['Poppins'] bg-[var(--color-neutral-g-100)] hover:bg-[var(--color-neutral-g-200)] cursor-pointer"
                onClick={() => updateFilter('accounts', [])}
              >
                {filters.accounts.length} account{filters.accounts.length > 1 ? 's' : ''}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {filters.categories.length > 0 && (
              <Badge
                variant="secondary"
                className="text-xs font-['Poppins'] bg-[var(--color-neutral-g-100)] hover:bg-[var(--color-neutral-g-200)] cursor-pointer"
                onClick={() => updateFilter('categories', [])}
              >
                {filters.categories.length} categor{filters.categories.length > 1 ? 'ies' : 'y'}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {filters.status.length > 0 && (
              <Badge
                variant="secondary"
                className="text-xs font-['Poppins'] bg-[var(--color-neutral-g-100)] hover:bg-[var(--color-neutral-g-200)] cursor-pointer"
                onClick={() => updateFilter('status', [])}
              >
                {filters.status.join(', ')}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {(filters.amountRange.min !== undefined || filters.amountRange.max !== undefined) && (
              <Badge
                variant="secondary"
                className="text-xs font-['Poppins'] bg-[var(--color-neutral-g-100)] hover:bg-[var(--color-neutral-g-200)] cursor-pointer"
                onClick={() => updateFilter('amountRange', { min: undefined, max: undefined })}
              >
                Amount filter
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
          </>
        )}
      </div>
    </div>
  )
}
