import { TableRow, TableHead } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Category } from '@/lib/transactions-data'
import {
  X,
  FolderOpen,
  Trash2,
  ChevronDown,
} from 'lucide-react'
import { ColumnVisibility, CategoryDisplayMode } from './TransactionFilters'

interface BulkActionsHeaderProps {
  selectedCount: number
  totalCount: number
  categories: Category[]
  onCategoryChange: (categoryId: string) => void
  onDelete: () => void
  onClearSelection: () => void
  onSelectAll: () => void
  isAllSelected: boolean
  columnVisibility: ColumnVisibility
  categoryDisplayMode: CategoryDisplayMode
}

export function BulkActionsHeader({
  selectedCount,
  totalCount,
  categories,
  onCategoryChange,
  onDelete,
  onClearSelection,
  onSelectAll,
  isAllSelected,
  columnVisibility,
  categoryDisplayMode,
}: BulkActionsHeaderProps) {
  // Calculate visible column count
  const visibleColumnCount = Object.values(columnVisibility).filter(Boolean).length + 2 // +2 for checkbox and actions

  return (
    <TableRow className="bg-[var(--color-primary-p-500)] hover:bg-[var(--color-primary-p-500)]">
      <TableHead colSpan={visibleColumnCount} className="h-14">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Selection info */}
            <div className="flex items-center gap-2">
              <button
                onClick={onClearSelection}
                className="p-1 rounded hover:bg-white/20 transition-colors text-white"
              >
                <X className="h-4 w-4" />
              </button>
              <span className="font-['Poppins'] text-white font-medium">
                {selectedCount} selected
              </span>
              {!isAllSelected && (
                <button
                  onClick={onSelectAll}
                  className="text-white/80 hover:text-white text-sm font-['Poppins'] underline"
                >
                  Select all {totalCount}
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-white/30" />

            {/* Bulk Actions */}
            <div className="flex items-center gap-2">
              {/* Change Category */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 hover:text-white font-['Poppins']"
                  >
                    <FolderOpen className="h-4 w-4 mr-1.5" />
                    Category
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="start">
                  <div className="space-y-1 max-h-[300px] overflow-y-auto">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => onCategoryChange(cat.id)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-[#fafafa] transition-colors"
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
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Delete */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-white hover:bg-red-500/30 hover:text-white font-['Poppins']"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </TableHead>
    </TableRow>
  )
}
