import { useState, useRef, useEffect } from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Transaction,
  Category,
  getAccountById,
  getCategoryById,
  formatCurrency,
  formatDate,
} from '@/lib/transactions-data'
import {
  MoreHorizontal,
  Check,
  X,
  Trash2,
  Eye,
  EyeOff,
  MessageSquare,
} from 'lucide-react'
import { ColumnVisibility, CategoryDisplayMode } from './TransactionFilters'

interface TransactionRowProps {
  transaction: Transaction
  index: number
  isSelected: boolean
  onSelect: (id: string, checked: boolean, index: number, shiftKey: boolean) => void
  onUpdate: (id: string, updates: Partial<Transaction>) => void
  onDelete: (id: string) => void
  categories: Category[]
  columnVisibility: ColumnVisibility
  categoryDisplayMode: CategoryDisplayMode
}

export function TransactionRow({
  transaction,
  index,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  categories,
  columnVisibility,
  categoryDisplayMode,
}: TransactionRowProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState(transaction.notes)
  const notesInputRef = useRef<HTMLInputElement>(null)

  const account = getAccountById(transaction.accountId)
  const category = getCategoryById(transaction.categoryId)

  useEffect(() => {
    if (isEditingNotes && notesInputRef.current) {
      notesInputRef.current.focus()
    }
  }, [isEditingNotes])

  const handleNotesSubmit = () => {
    onUpdate(transaction.id, { notes: notesValue })
    setIsEditingNotes(false)
  }

  const handleNotesCancel = () => {
    setNotesValue(transaction.notes)
    setIsEditingNotes(false)
  }

  const handleCategoryChange = (categoryId: string) => {
    onUpdate(transaction.id, { categoryId, categorySource: 'manual' })
  }

  const handleToggleHidden = () => {
    onUpdate(transaction.id, { isHidden: !transaction.isHidden })
  }

  const isExpense = transaction.amount < 0
  const amountColor = isExpense
    ? 'text-[var(--color-neutral-n-800)]'
    : 'text-[#2D7A4B]'

  return (
    <TableRow
      className={`
        hover:bg-[#fafafa] transition-colors
        ${isSelected ? 'bg-[var(--color-primary-p-50)]' : ''}
        ${transaction.isHidden ? 'opacity-50' : ''}
      `}
    >
      {/* Checkbox */}
      <TableCell className="w-[50px]">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => {
            // Get the native event to check for shift key
            const event = window.event as MouseEvent | undefined
            onSelect(transaction.id, !!checked, index, event?.shiftKey ?? false)
          }}
          aria-label={`Select transaction from ${transaction.merchant}`}
        />
      </TableCell>

      {/* Date */}
      {columnVisibility.date && (
        <TableCell className="font-['Poppins'] text-[var(--color-neutral-n-800)]">
          {formatDate(transaction.date)}
        </TableCell>
      )}

      {/* Merchant */}
      {columnVisibility.merchant && (
        <TableCell>
          <div className="flex flex-col">
            <span className="font-['Poppins'] font-medium text-[var(--color-neutral-n-800)]">
              {transaction.merchant}
            </span>
            {transaction.notes && !isEditingNotes && (
              <span className="text-xs text-[var(--color-neutral-n-500)] font-['Poppins'] mt-0.5">
                {transaction.notes}
              </span>
            )}
            {isEditingNotes && (
              <div className="flex items-center gap-1 mt-1">
                <Input
                  ref={notesInputRef}
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNotesSubmit()
                    if (e.key === 'Escape') handleNotesCancel()
                  }}
                  className="h-7 text-xs font-['Poppins']"
                  placeholder="Add a note..."
                />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleNotesSubmit}>
                  <Check className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleNotesCancel}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </TableCell>
      )}

      {/* Account */}
      {columnVisibility.account && (
        <TableCell className="font-['Poppins'] text-[var(--color-neutral-n-600)]">
          {account ? `${account.institution} ••${account.lastFour}` : 'Unknown'}
        </TableCell>
      )}

      {/* Category - Inline Editable */}
      {columnVisibility.category && (
        <TableCell>
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                {categoryDisplayMode === 'emoji' ? (
                  <span className="text-base">{category?.emoji ?? '❓'}</span>
                ) : (
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category?.color ?? '#8d9291' }}
                  />
                )}
                <span className="font-['Poppins'] text-sm text-[var(--color-neutral-n-800)]">
                  {category?.name ?? 'Uncategorized'}
                </span>
                {transaction.categorySource === 'ai' && transaction.categoryId && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 font-['Poppins']">
                    AI
                  </Badge>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`
                      w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left
                      hover:bg-[#fafafa] transition-colors
                      ${transaction.categoryId === cat.id ? 'bg-[var(--color-primary-p-50)]' : ''}
                    `}
                  >
                    {categoryDisplayMode === 'emoji' ? (
                      <span className="text-base">{cat.emoji}</span>
                    ) : (
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                    )}
                    <span className="font-['Poppins'] text-sm">{cat.name}</span>
                    {transaction.categoryId === cat.id && (
                      <Check className="h-4 w-4 ml-auto text-[var(--color-primary-p-500)]" />
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </TableCell>
      )}

      {/* Amount */}
      {columnVisibility.amount && (
        <TableCell className={`text-right font-['Poppins'] font-semibold ${amountColor}`}>
          {formatCurrency(transaction.amount)}
        </TableCell>
      )}

      {/* Status */}
      {columnVisibility.status && (
        <TableCell>
          <div className="flex items-center gap-2">
            {transaction.status === 'pending' && (
              <Badge variant="outline" className="text-xs font-['Poppins'] text-amber-600 border-amber-200 bg-amber-50">
                Pending
              </Badge>
            )}
          </div>
        </TableCell>
      )}

      {/* Actions */}
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setIsEditingNotes(true)} className="cursor-pointer font-['Poppins']">
              <MessageSquare className="h-4 w-4 mr-2" />
              {transaction.notes ? 'Edit note' : 'Add note'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleHidden} className="cursor-pointer font-['Poppins']">
              {transaction.isHidden ? (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show in reports
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide from reports
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(transaction.id)}
              className="cursor-pointer font-['Poppins'] text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete transaction
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
