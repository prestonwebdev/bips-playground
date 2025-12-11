/**
 * ChatBar Component
 *
 * A persistent chat interface anchored to the bottom of the viewport.
 * Supports multiple states with smooth spring animations using motion.dev.
 *
 * ## States:
 * - `minimized`: Compact bar showing only the input and quick suggestions
 * - `focused`: Input is focused, ready to type
 * - `active`: Chat is started, showing conversation history
 * - `expanded`: Full-height expanded view for longer conversations
 *
 * ## Features:
 * - Spring animations with subtle bounce effect
 * - Suggested prompts that fade in/out based on state
 * - Responsive width adapting to viewport
 * - Persistent positioning at viewport bottom
 *
 * ## Usage:
 * ```tsx
 * import ChatBar from '@/components/ChatBar'
 *
 * function App() {
 *   return (
 *     <div>
 *       <main>Your content here</main>
 *       <ChatBar />
 *     </div>
 *   )
 * }
 * ```
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  Zap,
  MessageCircle,
  Paperclip,
  ArrowUp,
  Minus,
  Pen,
  Trash2,
  X,
  FileSpreadsheet,
  FileText,
  Image,
  File,
  Loader2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/** Chat bar state options */
type ChatState = 'minimized' | 'focused' | 'active' | 'expanded'

/** Height constraints for dragging */
const MAX_CHAT_HEIGHT = 850 // Maximum expanded height
const COLLAPSE_THRESHOLD = 350 // Below this height, snap to minimized

/** Message attachment type */
interface MessageAttachment {
  id: string
  name: string
  type: string
}

/** Message type for chat history */
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  attachments?: MessageAttachment[]
}

/** Suggested prompt type */
interface SuggestedPrompt {
  id: string
  icon: 'zap' | 'message' | 'more'
  label: string
  primary?: boolean
}

/** Default suggested prompts shown in minimized/focused state */
const defaultPrompts: SuggestedPrompt[] = [
  { id: '1', icon: 'zap', label: 'Daily Report', primary: true },
 
  { id: '3', icon: 'message', label: 'Where can I cut my costs?' },
  { id: '4', icon: 'more', label: 'More' },
]

/** Additional suggested questions for "More" dropdown */
const additionalQuestions = [
  { id: 'q1', label: 'What were my top expenses last month?' },
  { id: 'q2', label: 'Compare my revenue to last quarter' },
  { id: 'q3', label: 'How is my cash flow trending?' },
  { id: 'q4', label: 'Show me my profit margins' },
  { id: 'q5', label: 'Which customers bring the most revenue?' },
  { id: 'q6', label: 'What invoices are overdue?' },
]

/** History item type */
interface HistoryItem {
  id: string
  title: string
  category: 'recent' | 'older'
}

/** Uploaded file type */
interface UploadedFile {
  id: string
  name: string
  type: string
  status: 'uploading' | 'complete'
}

/** Mock history data */
const mockHistoryItems: HistoryItem[] = [
  { id: 'h1', title: 'Business performance overview', category: 'recent' },
  { id: 'h2', title: 'Cost breakdown — August', category: 'recent' },
  { id: 'h3', title: 'How much did I spend on marketing in 2024?', category: 'recent' },
  { id: 'h4', title: 'Business performance overview', category: 'older' },
  { id: 'h5', title: 'Cost breakdown — August', category: 'older' },
  { id: 'h6', title: 'How much did I spend on marketing in 2024?', category: 'older' },
]

/** Spring animation configuration with subtle bounce */
const springTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
  mass: 1,
}

/** Fade transition for prompts */
const fadeTransition = {
  duration: 0.2,
  ease: 'easeInOut' as const,
}

/** Quick exit transition for minimizing */
const quickExitTransition = {
  duration: 0.15,
  ease: 'easeOut' as const,
}

/** Height values for each state */
const stateHeights: Record<ChatState, number> = {
  minimized: 64, // matches input bar height exactly
  focused: 160, // top padding (16px) + actions row (44px) + gap (20px) + input (64px) + bottom padding (16px)
  active: 601,
  expanded: 848,
}

interface ChatBarProps {
  /** Offset from left edge to center within content area (e.g., sidebar width) */
  contentOffset?: number
  /** Start with the chat in focused state (visual focus, not autofocus) */
  defaultFocused?: boolean
}

export default function ChatBar({ contentOffset = 0, defaultFocused = false }: ChatBarProps) {
  const [state, setState] = useState<ChatState>(defaultFocused ? 'focused' : 'minimized')
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [customHeight, setCustomHeight] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [historyItems] = useState<HistoryItem[]>(mockHistoryItems)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputBarRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef<number>(0)
  const dragStartHeight = useRef<number>(0)
  const savedScrollPosition = useRef<number>(0)

  /** Whether there's an active chat history */
  const hasHistory = messages.length > 0

  /** Handle input focus */
  const handleFocus = () => {
    if (state === 'minimized' && !hasHistory) {
      setState('focused')
    }
  }

  /** Handle input blur */
  const handleBlur = (e: React.FocusEvent) => {
    // Check if the new focus target is still within the chat area
    const relatedTarget = e.relatedTarget as HTMLElement | null
    const isInsideContainer = containerRef.current?.contains(relatedTarget)
    const isInsideInputBar = inputBarRef.current?.contains(relatedTarget)
    const isInsideRadixPortal = relatedTarget?.closest('[data-radix-popper-content-wrapper]')
    const isFileInput = relatedTarget === fileInputRef.current

    // Don't minimize if focus is still in chat area, has content, or has files
    const stayOpen = isInsideContainer || isInsideInputBar || isInsideRadixPortal || isFileInput || inputValue.trim() || uploadedFiles.length > 0

    if (state === 'focused' && !stayOpen) {
      setState('minimized')
    }
  }

  /** Handle clicking the minimized bar when there's history */
  const handleRestoreChat = () => {
    if (state === 'minimized' && hasHistory) {
      setState('active')
    }
  }

  /** Handle clicking outside the chat to minimize */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Check if click is inside a Radix portal (dropdown menu)
      const isInsideRadixPortal = target.closest('[data-radix-popper-content-wrapper]')
      // Check if click is inside the background container
      const isInsideContainer = containerRef.current?.contains(target)
      // Check if click is inside the input bar
      const isInsideInputBar = inputBarRef.current?.contains(target)
      // Check if click is on the file input
      const isFileInput = target === fileInputRef.current

      if (
        !isInsideContainer &&
        !isInsideInputBar &&
        !isInsideRadixPortal &&
        !isFileInput &&
        (state === 'active' || state === 'expanded' || state === 'focused')
      ) {
        setState('minimized')
        setCustomHeight(null)
        setHistoryOpen(false)
        setMoreOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [state])

  /** Handle history item click */
  const handleHistoryItemClick = (item: HistoryItem) => {
    // In a real app, this would load the conversation
    console.log('Load conversation:', item.title)
  }

  /** Handle delete history item */
  const handleDeleteHistoryItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation()
    // In a real app, this would delete the item
    console.log('Delete item:', itemId)
  }

  /** Handle edit history item */
  const handleEditHistoryItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation()
    // In a real app, this would edit the item title
    console.log('Edit item:', itemId)
  }

  /** Handle sending a message */
  const handleSend = () => {
    if (!inputValue.trim() && uploadedFiles.length === 0) return

    // Convert uploaded files to attachments
    const attachments: MessageAttachment[] = uploadedFiles
      .filter((f) => f.status === 'complete')
      .map((f) => ({
        id: f.id,
        name: f.name,
        type: f.type,
      }))

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      attachments: attachments.length > 0 ? attachments : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setUploadedFiles([])
    setState('active')

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(userMessage.content),
      }
      setMessages((prev) => [...prev, assistantMessage])
    }, 1000)
  }

  /** Handle keyboard submit */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  /** Handle suggested prompt click */
  const handlePromptClick = (prompt: SuggestedPrompt) => {
    if (prompt.icon === 'more') {
      // Dropdown handles this
      return
    }
    setInputValue(prompt.label)
    inputRef.current?.focus()
  }

  /** Handle additional question click from More dropdown */
  const handleAdditionalQuestionClick = (question: string) => {
    setInputValue(question)
    setMoreOpen(false)
    inputRef.current?.focus()
  }

  /** Minimize chat */
  const handleMinimize = () => {
    setState('minimized')
    setCustomHeight(null)
    setHistoryOpen(false)
    setMoreOpen(false)
  }

  /** Handle drag start */
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (state !== 'active' && state !== 'expanded') return

    setIsDragging(true)
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    dragStartY.current = clientY
    dragStartHeight.current = customHeight || stateHeights[state]

    e.preventDefault()
  }, [state, customHeight])

  /** Handle drag move */
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const deltaY = dragStartY.current - clientY // Negative when dragging down
    const newHeight = Math.min(MAX_CHAT_HEIGHT, Math.max(200, dragStartHeight.current + deltaY))

    setCustomHeight(newHeight)
  }, [isDragging])

  /** Handle drag end */
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return

    setIsDragging(false)

    // Snap to states based on final height
    if (customHeight && customHeight < COLLAPSE_THRESHOLD) {
      // Collapse to minimized
      setState('minimized')
      setCustomHeight(null)
    } else if (customHeight && customHeight >= MAX_CHAT_HEIGHT - 50) {
      // Snap to expanded
      setState('expanded')
      setCustomHeight(null)
    } else if (customHeight && customHeight < stateHeights.active + 50) {
      // Snap to active
      setState('active')
      setCustomHeight(null)
    }
    // Otherwise keep the custom height
  }, [isDragging, customHeight])

  /** Set up drag event listeners */
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove)
      window.addEventListener('mouseup', handleDragEnd)
      window.addEventListener('touchmove', handleDragMove)
      window.addEventListener('touchend', handleDragEnd)

      return () => {
        window.removeEventListener('mousemove', handleDragMove)
        window.removeEventListener('mouseup', handleDragEnd)
        window.removeEventListener('touchmove', handleDragMove)
        window.removeEventListener('touchend', handleDragEnd)
      }
    }
  }, [isDragging, handleDragMove, handleDragEnd])

  /** Start new chat */
  const handleNewChat = (e?: React.MouseEvent) => {
    e?.stopPropagation() // Prevent triggering restore chat
    setMessages([])
    setInputValue('')
    setUploadedFiles([])
    setState('focused')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  /** Get icon component based on file type */
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv') || fileType.endsWith('.xlsx') || fileType.endsWith('.xls')) {
      return FileSpreadsheet
    }
    if (fileType.includes('pdf')) {
      return FileText
    }
    if (fileType.includes('image')) {
      return Image
    }
    return File
  }

  /** Handle file selection */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Go to focused state when files are added
    if (state === 'minimized') {
      setState('focused')
    }

    Array.from(files).forEach((file) => {
      const newFile: UploadedFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type || file.name,
        status: 'uploading',
      }

      setUploadedFiles((prev) => [...prev, newFile])

      // Simulate upload delay
      setTimeout(() => {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === newFile.id ? { ...f, status: 'complete' } : f))
        )
      }, 1500)
    })

    // Clear the input so the same file can be selected again
    e.target.value = ''
  }

  /** Handle attachment button click */
  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  /** Remove uploaded file */
  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  /** Save scroll position when minimizing, restore when opening */
  useEffect(() => {
    if (state === 'minimized' && chatContainerRef.current) {
      // Save scroll position when minimizing
      savedScrollPosition.current = chatContainerRef.current.scrollTop
    } else if ((state === 'active' || state === 'expanded') && chatContainerRef.current) {
      // Restore scroll position when opening
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = savedScrollPosition.current
        }
      }, 50)
    }
  }, [state])

  const showChatContent = state === 'active' || state === 'expanded'
  const showExpandControls = state === 'active' || state === 'expanded'

  /** Calculate current height - add extra space for file chips */
  const fileChipsHeight = uploadedFiles.length > 0 ? 44 : 0
  const baseHeight = customHeight || stateHeights[state]
  const currentHeight = (state === 'focused' || state === 'minimized') && uploadedFiles.length > 0
    ? baseHeight + fileChipsHeight
    : baseHeight

  /** Calculate chat content height (total height minus header and input bar) */
  // 92px = header area (16px top padding + 44px button + 32px gap)
  // 80px = input bar area
  const chatContentHeight = currentHeight - 92 - 80

  return (
    <>
    {/* Background Container - Animates behind the input */}
    <motion.div
      ref={containerRef}
      className={cn(
        'fixed z-40',
        'rounded-[var(--radius-32)]',
        state !== 'minimized' && 'bg-[var(--color-white)] shadow-[var(--shadow-large)] border border-[var(--color-neutral-g-100)]',
        isDragging && 'select-none',
        showChatContent && 'overflow-hidden'
      )}
      style={{
        left: `calc(50% + ${contentOffset / 2}px)`,
        transform: 'translateX(-50%)',
      }}
      initial={{ height: stateHeights.minimized, width: 900, bottom: 32 }}
      animate={{
        height: currentHeight,
        width: showChatContent ? 931 : state === 'focused' ? 931 : 900,
        bottom: state === 'minimized' ? 32 : 16, // Expand down 16px below input
      }}
      transition={isDragging ? { duration: 0 } : springTransition}
    >
      {/* Suggestions Row - Visible in focused state only (above input) */}
      <AnimatePresence>
        {state === 'focused' && (
          <motion.div
            className="absolute top-[var(--space-16)] left-[var(--space-16)] right-[var(--space-16)] h-[44px] flex items-center justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={fadeTransition}
          >
            {/* History Button with Dropdown - Left side */}
            <DropdownMenu open={historyOpen} onOpenChange={setHistoryOpen} modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-[var(--space-8)] px-[var(--space-16)] py-[var(--space-8)] rounded-[var(--radius-full)] border border-[var(--color-neutral-g-200)] hover:bg-[var(--color-neutral-g-50)] transition-colors shrink-0 cursor-pointer">
                  <span className="text-sm text-[var(--color-neutral-n-700)] font-sans tracking-[-0.28px]">
                    History
                  </span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--color-neutral-n-700)]">
                    <motion.path
                      d="M18 15L12 9L6 15"
                      animate={{ d: historyOpen ? "M18 12L12 12L6 12" : "M18 15L12 9L6 15" }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="top"
                sideOffset={8}
                className="w-[320px] p-[var(--space-16)] bg-white border border-[var(--color-neutral-g-100)] rounded-[var(--radius-12)] shadow-lg"
              >
                {/* Last 7 Days Section */}
                <DropdownMenuLabel className="text-[13px] text-[var(--color-primary-p-500)] font-sans font-normal tracking-[-0.26px] leading-5 px-[var(--space-8)] py-[var(--space-4)] mb-[var(--space-4)]">
                  Last 7 Days
                </DropdownMenuLabel>
                {historyItems
                  .filter((item) => item.category === 'recent')
                  .map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      className="group flex items-center justify-between px-[var(--space-8)] py-[var(--space-10)] rounded-[var(--radius-8)] cursor-pointer transition-colors focus:bg-[var(--color-neutral-g-50)] hover:bg-[var(--color-neutral-g-50)]"
                      onClick={() => handleHistoryItemClick(item)}
                    >
                      <span className="text-[15px] text-[var(--color-neutral-n-800)] font-sans tracking-[-0.3px] leading-6 flex-1 truncate pr-[var(--space-8)]">
                        {item.title}
                      </span>
                      <div className="flex items-center gap-[var(--space-8)] shrink-0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleEditHistoryItem(e, item.id)}
                          className="p-[var(--space-4)] hover:bg-[var(--color-neutral-g-200)] rounded-[var(--radius-8)] transition-colors"
                        >
                          <Pen className="w-4 h-4 text-[var(--color-neutral-n-600)]" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                          className="p-[var(--space-4)] hover:bg-[var(--color-neutral-g-200)] rounded-[var(--radius-8)] transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-[var(--color-neutral-n-600)]" />
                        </button>
                      </div>
                    </DropdownMenuItem>
                  ))}

                {/* Divider */}
                <DropdownMenuSeparator className="h-px bg-[var(--color-neutral-g-200)] my-[var(--space-12)] -mx-[var(--space-8)]" />

                {/* Older Section */}
                <DropdownMenuLabel className="text-[13px] text-[var(--color-primary-p-500)] font-sans font-normal tracking-[-0.26px] leading-5 px-[var(--space-8)] py-[var(--space-4)] mb-[var(--space-4)]">
                  Older
                </DropdownMenuLabel>
                {historyItems
                  .filter((item) => item.category === 'older')
                  .map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      className="group flex items-center justify-between px-[var(--space-8)] py-[var(--space-10)] rounded-[var(--radius-8)] cursor-pointer transition-colors focus:bg-[var(--color-neutral-g-50)] hover:bg-[var(--color-neutral-g-50)]"
                      onClick={() => handleHistoryItemClick(item)}
                    >
                      <span className="text-[15px] text-[var(--color-neutral-n-800)] font-sans tracking-[-0.3px] leading-6 flex-1 truncate pr-[var(--space-8)]">
                        {item.title}
                      </span>
                      <div className="flex items-center gap-[var(--space-8)] shrink-0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleEditHistoryItem(e, item.id)}
                          className="p-[var(--space-4)] hover:bg-[var(--color-neutral-g-200)] rounded-[var(--radius-8)] transition-colors"
                        >
                          <Pen className="w-4 h-4 text-[var(--color-neutral-n-600)]" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                          className="p-[var(--space-4)] hover:bg-[var(--color-neutral-g-200)] rounded-[var(--radius-8)] transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-[var(--color-neutral-n-600)]" />
                        </button>
                      </div>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Suggested Prompts - Right side */}
            <div className="flex items-center gap-[var(--space-12)]">
              {defaultPrompts.map((prompt, index) => {
                // Render More button as a dropdown
                if (prompt.icon === 'more') {
                  return (
                    <DropdownMenu key={prompt.id} open={moreOpen} onOpenChange={setMoreOpen} modal={false}>
                      <DropdownMenuTrigger asChild>
                        <motion.button
                          className="flex items-center gap-[var(--space-8)] px-[var(--space-16)] py-[var(--space-8)] rounded-[var(--radius-full)] border border-[var(--color-neutral-g-200)] text-[var(--color-neutral-n-700)] hover:bg-[var(--color-neutral-g-50)] transition-colors cursor-pointer"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ...fadeTransition, delay: index * 0.05 }}
                        >
                          <span className="text-sm font-sans tracking-[-0.28px]">
                            {prompt.label}
                          </span>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--color-neutral-n-700)] -mr-1">
                            <motion.path
                              d="M18 15L12 9L6 15"
                              animate={{ d: moreOpen ? "M18 12L12 12L6 12" : "M18 15L12 9L6 15" }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </motion.button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        side="top"
                        sideOffset={8}
                        className="w-[320px] p-[var(--space-12)] bg-white border border-[var(--color-neutral-g-100)] rounded-[var(--radius-12)] shadow-lg"
                      >
                        <DropdownMenuLabel className="text-[13px] text-[var(--color-primary-p-500)] font-sans font-normal tracking-[-0.26px] leading-5 px-[var(--space-8)] py-[var(--space-4)] mb-[var(--space-4)]">
                          Suggested Questions
                        </DropdownMenuLabel>
                        {additionalQuestions.map((question) => (
                          <DropdownMenuItem
                            key={question.id}
                            className="flex items-center gap-[var(--space-8)] px-[var(--space-8)] py-[var(--space-10)] rounded-[var(--radius-8)] cursor-pointer transition-colors focus:bg-[var(--color-neutral-g-50)] hover:bg-[var(--color-neutral-g-50)]"
                            onClick={() => handleAdditionalQuestionClick(question.label)}
                          >
                            <MessageCircle className="w-4 h-4 text-[var(--color-neutral-n-600)] shrink-0" />
                            <span className="text-[15px] text-[var(--color-neutral-n-800)] font-sans tracking-[-0.3px] leading-6">
                              {question.label}
                            </span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                }

                // Regular prompt buttons
                return (
                  <motion.button
                    key={prompt.id}
                    onClick={() => handlePromptClick(prompt)}
                    className={cn(
                      'flex items-center gap-[var(--space-8)] px-[var(--space-16)] py-[var(--space-8)] rounded-[var(--radius-full)] border transition-colors',
                      prompt.primary
                        ? 'border-[var(--color-primary-p-500)] text-[var(--color-primary-p-500)] hover:bg-[var(--color-primary-p-500)]/5'
                        : 'border-[var(--color-neutral-g-200)] text-[var(--color-neutral-n-700)] hover:bg-[var(--color-neutral-g-50)]'
                    )}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...fadeTransition, delay: index * 0.05 }}
                  >
                    {prompt.icon === 'zap' && (
                      <Zap className="w-5 h-5" />
                    )}
                    {prompt.icon === 'message' && (
                      <MessageCircle className="w-5 h-5" />
                    )}
                    <span className="text-sm font-sans tracking-[-0.28px]">
                      {prompt.label}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Row - Only visible in active/expanded states */}
      <AnimatePresence mode="sync">
        {showExpandControls && (
          <motion.div
            className="absolute top-[var(--space-16)] left-0 right-0 mx-auto w-[896px] flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={quickExitTransition}
          >
            {/* History Button with Dropdown */}
            <DropdownMenu open={historyOpen} onOpenChange={setHistoryOpen} modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-[var(--space-8)] px-[var(--space-16)] py-[var(--space-8)] rounded-[var(--radius-full)] border border-[var(--color-neutral-g-200)] hover:bg-[var(--color-neutral-g-50)] transition-colors cursor-pointer">
                  <span className="text-sm text-[var(--color-neutral-n-700)] font-sans tracking-[-0.28px]">
                    History
                  </span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--color-neutral-n-700)]">
                    <motion.path
                      d="M18 9L12 15L6 9"
                      animate={{ d: historyOpen ? "M18 12L12 12L6 12" : "M18 9L12 15L6 9" }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="bottom"
                sideOffset={8}
                className="w-[320px] p-[var(--space-16)] bg-white border border-[var(--color-neutral-g-100)] rounded-[var(--radius-12)] shadow-lg"
              >
                {/* Last 7 Days Section */}
                <DropdownMenuLabel className="text-[13px] text-[var(--color-primary-p-500)] font-sans font-normal tracking-[-0.26px] leading-5 px-[var(--space-8)] py-[var(--space-4)] mb-[var(--space-4)]">
                  Last 7 Days
                </DropdownMenuLabel>
                {historyItems
                  .filter((item) => item.category === 'recent')
                  .map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      className="group flex items-center justify-between px-[var(--space-8)] py-[var(--space-10)] rounded-[var(--radius-8)] cursor-pointer transition-colors focus:bg-[var(--color-neutral-g-50)] hover:bg-[var(--color-neutral-g-50)]"
                      onClick={() => handleHistoryItemClick(item)}
                    >
                      <span className="text-[15px] text-[var(--color-neutral-n-800)] font-sans tracking-[-0.3px] leading-6 flex-1 truncate pr-[var(--space-8)]">
                        {item.title}
                      </span>
                      <div className="flex items-center gap-[var(--space-8)] shrink-0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleEditHistoryItem(e, item.id)}
                          className="p-[var(--space-4)] hover:bg-[var(--color-neutral-g-200)] rounded-[var(--radius-8)] transition-colors"
                        >
                          <Pen className="w-4 h-4 text-[var(--color-neutral-n-600)]" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                          className="p-[var(--space-4)] hover:bg-[var(--color-neutral-g-200)] rounded-[var(--radius-8)] transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-[var(--color-neutral-n-600)]" />
                        </button>
                      </div>
                    </DropdownMenuItem>
                  ))}

                {/* Divider */}
                <DropdownMenuSeparator className="h-px bg-[var(--color-neutral-g-200)] my-[var(--space-12)] -mx-[var(--space-8)]" />

                {/* Older Section */}
                <DropdownMenuLabel className="text-[13px] text-[var(--color-primary-p-500)] font-sans font-normal tracking-[-0.26px] leading-5 px-[var(--space-8)] py-[var(--space-4)] mb-[var(--space-4)]">
                  Older
                </DropdownMenuLabel>
                {historyItems
                  .filter((item) => item.category === 'older')
                  .map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      className="group flex items-center justify-between px-[var(--space-8)] py-[var(--space-10)] rounded-[var(--radius-8)] cursor-pointer transition-colors focus:bg-[var(--color-neutral-g-50)] hover:bg-[var(--color-neutral-g-50)]"
                      onClick={() => handleHistoryItemClick(item)}
                    >
                      <span className="text-[15px] text-[var(--color-neutral-n-800)] font-sans tracking-[-0.3px] leading-6 flex-1 truncate pr-[var(--space-8)]">
                        {item.title}
                      </span>
                      <div className="flex items-center gap-[var(--space-8)] shrink-0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleEditHistoryItem(e, item.id)}
                          className="p-[var(--space-4)] hover:bg-[var(--color-neutral-g-200)] rounded-[var(--radius-8)] transition-colors"
                        >
                          <Pen className="w-4 h-4 text-[var(--color-neutral-n-600)]" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                          className="p-[var(--space-4)] hover:bg-[var(--color-neutral-g-200)] rounded-[var(--radius-8)] transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-[var(--color-neutral-n-600)]" />
                        </button>
                      </div>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Right side controls */}
            <div className="flex items-center gap-[var(--space-12)]">
              {/* New Chat Button */}
              <button
                onClick={handleNewChat}
                className="flex items-center gap-[var(--space-8)] px-[var(--space-16)] py-[var(--space-8)] rounded-[var(--radius-full)] border border-[var(--color-neutral-g-200)] hover:bg-[var(--color-neutral-g-50)] transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-[var(--color-neutral-n-700)]" />
                <span className="text-sm text-[var(--color-neutral-n-700)] font-sans tracking-[-0.28px]">
                  New Chat
                </span>
              </button>

              {/* Minimize Button */}
              <button
                onClick={handleMinimize}
                className="p-[var(--space-8)] hover:bg-[var(--color-neutral-g-50)] rounded-[var(--radius-full)] transition-colors"
              >
                <Minus className="w-5 h-5 text-[var(--color-neutral-n-700)]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag Handle - Centered at top, only in active/expanded states */}
      <AnimatePresence mode="sync">
        {showExpandControls && (
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[20px] flex items-center justify-center cursor-ns-resize z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={quickExitTransition}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="w-[40px] h-[4px] bg-[var(--color-neutral-g-200)] rounded-full hover:bg-[var(--color-neutral-g-400)] transition-colors" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Content Area */}
      <AnimatePresence mode="sync">
        {showChatContent && (
          <motion.div
            className="absolute top-[92px] left-0 right-0 mx-auto w-[896px]"
            style={{
              height: Math.max(200, chatContentHeight),
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={quickExitTransition}
          >
            {/* Scrollable content */}
            <div
              ref={chatContainerRef}
              className="h-full overflow-y-auto overflow-x-hidden"
            >
              <div className="flex flex-col gap-[var(--space-16)] pb-[80px]">
                {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      className={cn(
                        'max-w-[70%] px-[var(--space-12)] py-[var(--space-20)] rounded-[var(--radius-16)]',
                        message.role === 'user'
                          ? 'self-end bg-[var(--color-neutral-g-50)]'
                          : 'self-start'
                      )}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={springTransition}
                    >
                      {message.role === 'assistant' && (
                        <h3 className="text-[22px] font-semibold font-sans leading-9 tracking-[-0.44px] text-black mb-[var(--space-8)]">
                          Business Performance Update
                        </h3>
                      )}
                      {message.content && (
                        <p className="text-base font-sans leading-7 tracking-[-0.32px] text-black whitespace-pre-wrap">
                          {message.content}
                        </p>
                      )}
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className={cn('flex flex-wrap gap-[var(--space-8)]', message.content && 'mt-[var(--space-12)]')}>
                          {message.attachments.map((attachment) => {
                            const AttachmentIcon = getFileIcon(attachment.type)
                            return (
                              <div
                                key={attachment.id}
                                className="flex items-center gap-[var(--space-8)] px-[var(--space-12)] py-[var(--space-8)] bg-white rounded-[var(--radius-12)] border border-[var(--color-neutral-g-200)]"
                              >
                                <AttachmentIcon className="w-5 h-5 text-[var(--color-neutral-n-600)]" />
                                <span className="text-sm text-[var(--color-neutral-n-700)] font-sans tracking-[-0.28px] max-w-[180px] truncate">
                                  {attachment.name}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </motion.div>
                ))}
              </div>
            </div>

            {/* Bottom fade gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-[80px] pointer-events-none bg-gradient-to-t from-white via-white/80 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>

    {/* Hidden File Input */}
    <input
      ref={fileInputRef}
      type="file"
      className="hidden"
      onChange={handleFileSelect}
      multiple
      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.txt"
    />

    {/* Input Bar - Fixed position, doesn't move */}
    <div
      ref={inputBarRef}
      className={cn(
        'fixed bottom-[var(--space-32)] w-[900px] z-50',
        'bg-[var(--color-white)] border border-[var(--color-neutral-g-200)] rounded-[var(--radius-32)]',
        'shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12),0_2px_8px_-2px_rgba(0,0,0,0.08)]',
        state !== 'minimized' && 'shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12),0_2px_8px_-2px_rgba(0,0,0,0.08),0_0_0.8px_6px_rgba(81,145,136,0.13)]',
        state === 'minimized' && hasHistory && 'cursor-pointer hover:border-[var(--color-neutral-g-200)]'
      )}
      style={{
        left: `calc(50% + ${contentOffset / 2}px)`,
        transform: 'translateX(-50%)',
      }}
      onClick={handleRestoreChat}
    >
        <div className="flex flex-col justify-center px-[var(--space-20)] py-[var(--space-12)]">
          {/* Minimized with history - Show summary and New Chat button */}
          {state === 'minimized' && hasHistory ? (
            <div className="w-full flex items-center justify-between">
              {/* Summary text */}
              <span className="text-base font-sans leading-7 tracking-[-0.32px] text-[var(--color-neutral-n-600)]">
                Continue asking about your business performance
              </span>

              {/* New Chat button */}
              <motion.button
                onClick={handleNewChat}
                className="flex items-center gap-[var(--space-8)] px-[var(--space-16)] py-[var(--space-8)] rounded-[var(--radius-full)] border border-[var(--color-neutral-g-200)] hover:bg-[var(--color-neutral-g-50)] transition-colors shrink-0"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle className="w-5 h-5 text-[var(--color-neutral-n-700)]" />
                <span className="text-sm text-[var(--color-neutral-n-700)] font-sans tracking-[-0.28px]">
                  New Chat
                </span>
              </motion.button>
            </div>
          ) : (
            <div className="w-full flex flex-col">
              {/* File Chips Row - Show above input when files are attached */}
              <AnimatePresence>
                {uploadedFiles.length > 0 && (
                  <motion.div
                    className="flex flex-wrap gap-[var(--space-8)] mb-[var(--space-8)]"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={fadeTransition}
                  >
                    {uploadedFiles.map((file) => {
                      const FileIcon = getFileIcon(file.type)
                      return (
                        <motion.div
                          key={file.id}
                          className="group flex items-center gap-[var(--space-8)] px-[var(--space-12)] py-[var(--space-8)] bg-white rounded-[var(--radius-full)] border border-[var(--color-neutral-g-200)] hover:bg-[var(--color-neutral-g-100)] transition-colors cursor-default"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={springTransition}
                        >
                          {file.status === 'uploading' ? (
                            <Loader2 className="w-4 h-4 text-[var(--color-neutral-n-600)] animate-spin" />
                          ) : (
                            <div className="relative w-4 h-4">
                              <FileIcon className="w-4 h-4 text-[var(--color-neutral-n-600)] group-hover:opacity-0 transition-opacity" />
                              <button
                                onClick={() => handleRemoveFile(file.id)}
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4 text-[var(--color-neutral-n-600)]" />
                              </button>
                            </div>
                          )}
                          <span className="text-sm text-[var(--color-neutral-n-700)] font-sans tracking-[-0.28px] max-w-[150px] truncate">
                            {file.name}
                          </span>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Row */}
              <div className="w-full flex items-center">
                {/* Bips Logo - Visible in minimized (no history) and focused states */}
                {(state === 'minimized' || state === 'focused') && !hasHistory && (
                  <motion.div
                    className="w-[21px] h-[27px] mr-[var(--space-12)] shrink-0"
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <svg
                      width="21"
                      height="27"
                      viewBox="0 0 21 27"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full"
                    >
                      <circle cx="6.63313" cy="20.0711" r="6.02962" fill="var(--color-primary-p-500)" />
                      <circle cx="15.191" cy="8.95953" r="5.0816" fill="var(--color-primary-p-500)" />
                      <circle cx="3.87806" cy="3.87806" r="3.87806" fill="var(--color-primary-p-500)" />
                    </svg>
                  </motion.div>
                )}

                {/* Input Field */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder={showChatContent ? '' : "Let's talk business. Ask anything."}
                  className={cn(
                    'flex-1 min-w-0 bg-transparent outline-none',
                    'font-sans text-base leading-7 tracking-[-0.32px]',
                    'text-[var(--color-neutral-n-800)] placeholder:text-[var(--color-neutral-n-600)]'
                  )}
                />

                {/* Right side buttons - Always on right */}
                <div className="flex items-center gap-[var(--space-14)] shrink-0 ml-[var(--space-12)]">
                  <motion.button
                    onClick={handleAttachClick}
                    className="p-[var(--space-10)] rounded-[var(--radius-full)] shadow-[var(--shadow-small)] hover:bg-[var(--color-neutral-g-50)] transition-colors border border-transparent focus:border-[var(--color-neutral-g-400)] focus:outline-none"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Paperclip className="w-5 h-5 text-[var(--color-neutral-n-700)]" />
                  </motion.button>
                  <motion.button
                    onClick={handleSend}
                    className="w-10 h-10 rounded-[var(--radius-full)] bg-[var(--color-brand-primary)] flex items-center justify-center hover:opacity-90 transition-opacity"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowUp className="w-6 h-6 text-white" />
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/**
 * Generate a mock response for demo purposes
 * In production, this would be replaced with actual API calls
 */
function generateMockResponse(userMessage: string): string {
  if (
    userMessage.toLowerCase().includes('perform') ||
    userMessage.toLowerCase().includes('business')
  ) {
    return `Monthly Summary:
In August, your business stayed profitable, but profit dropped from last month. You earned $79K in revenue and kept $9K as profit, which is about 11 cents from every dollar you made. The main reason profit fell is because sales came down by $12K while your expenses stayed the same.

Most of your spending goes into just a few areas:
Payroll ($38K) — nearly half of your revenue goes to paying your team.
Supplies ($13K) — about one-sixth of sales.
Fixed Costs like rent and licenses ($9K combined) that don't change month to month.

Takeaways and Suggestions:
You're still running profitable, which is great. To get more out of what you're making, you could think about putting a little extra into marketing (just 3% of sales right now) to help bring in new jobs, or look at whether supply costs can come down with bulk buying or new vendors. Even small tweaks here could add up over time.

Would you like to explore marketing strategies to increase revenue? You can also move on to your Revenue Insights to see what's driving revenue performance.`
  }

  return `I understand you're asking about "${userMessage}". Let me analyze that for your business and provide some insights.

Based on your current data, I can help you explore this topic further. Would you like me to dive deeper into any specific aspect?`
}
