import { useState } from 'react'
import { Send, Paperclip } from 'lucide-react'

interface AssistantInputProps {
  placeholder?: string
  onSend?: (message: string) => void
  onAttach?: () => void
}

export function AssistantInput({
  placeholder = "Let's talk business. Ask anything.",
  onSend,
  onAttach,
}: AssistantInputProps) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim()) {
      onSend?.(message)
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-4 py-3 shadow-sm">
      {/* AI Icon/Avatar */}
      <div className="flex items-center justify-center w-8 h-8 bg-[#2D7A4B] rounded-full flex-shrink-0">
        <div className="w-3 h-3 bg-white rounded-full" />
      </div>

      {/* Input */}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-[var(--color-neutral-n-800)] placeholder:text-[var(--color-neutral-n-400)] font-['Poppins'] text-sm"
      />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onAttach}
          className="p-1.5 text-[var(--color-neutral-n-600)] hover:text-[var(--color-neutral-n-800)] transition-colors"
          aria-label="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="p-2 bg-[#2D7A4B] text-white rounded-full hover:bg-[#235d3a] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
