/**
 * ChatBar Demo
 *
 * A demo page showcasing the ChatBar component with all its states
 * and animations. The ChatBar is anchored to the bottom of the viewport
 * and persists across the page.
 */

import ChatBar from '@/components/ChatBar'

export default function ChatBarDemo() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Sample page content to demonstrate ChatBar persistence */}
      <div className="max-w-4xl mx-auto p-8 pb-32">
        <header className="mb-12">
          <h1 className="text-3xl font-semibold font-['Poppins'] text-[#161a1a] mb-2">
            ChatBar Component Demo
          </h1>
          <p className="text-[#5a5f5e] font-['Poppins']">
            A persistent chat interface with spring animations
          </p>
        </header>

        <section className="space-y-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold font-['Poppins'] text-[#161a1a] mb-4">
              Instructions
            </h2>
            <ul className="space-y-3 text-[#5a5f5e] font-['Poppins']">
              <li className="flex items-start gap-2">
                <span className="text-[#467c75] font-medium">1.</span>
                <span>
                  Click on the input bar at the bottom to focus and see the
                  focused state
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#467c75] font-medium">2.</span>
                <span>
                  Type a message and press Enter or click the send button to
                  start a chat
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#467c75] font-medium">3.</span>
                <span>
                  Click on the resize handle to expand/collapse the chat window
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#467c75] font-medium">4.</span>
                <span>
                  Click the minimize button (—) to return to the minimized state
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#467c75] font-medium">5.</span>
                <span>
                  Try clicking the suggested prompts to auto-fill the input
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold font-['Poppins'] text-[#161a1a] mb-4">
              Component States
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#fafafa] rounded-xl">
                <h3 className="font-medium text-[#161a1a] font-['Poppins'] mb-2">
                  Minimized
                </h3>
                <p className="text-sm text-[#5a5f5e] font-['Poppins']">
                  Compact bar with suggestions visible. Height: 64px
                </p>
              </div>
              <div className="p-4 bg-[#fafafa] rounded-xl">
                <h3 className="font-medium text-[#161a1a] font-['Poppins'] mb-2">
                  Focused
                </h3>
                <p className="text-sm text-[#5a5f5e] font-['Poppins']">
                  Input focused, ready to type. Height: 169px
                </p>
              </div>
              <div className="p-4 bg-[#fafafa] rounded-xl">
                <h3 className="font-medium text-[#161a1a] font-['Poppins'] mb-2">
                  Active
                </h3>
                <p className="text-sm text-[#5a5f5e] font-['Poppins']">
                  Chat started, showing messages. Height: 601px
                </p>
              </div>
              <div className="p-4 bg-[#fafafa] rounded-xl">
                <h3 className="font-medium text-[#161a1a] font-['Poppins'] mb-2">
                  Expanded
                </h3>
                <p className="text-sm text-[#5a5f5e] font-['Poppins']">
                  Full-height view. Height: 848px
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold font-['Poppins'] text-[#161a1a] mb-4">
              Animation Details
            </h2>
            <div className="space-y-4 text-[#5a5f5e] font-['Poppins']">
              <div>
                <h3 className="font-medium text-[#161a1a] mb-1">
                  Spring Transition
                </h3>
                <p className="text-sm">
                  Stiffness: 400, Damping: 30, Mass: 1 — provides a subtle
                  bounce effect
                </p>
              </div>
              <div>
                <h3 className="font-medium text-[#161a1a] mb-1">
                  Fade Transitions
                </h3>
                <p className="text-sm">
                  Duration: 0.2s with easeInOut — used for suggestions and
                  content areas
                </p>
              </div>
              <div>
                <h3 className="font-medium text-[#161a1a] mb-1">
                  Staggered Animations
                </h3>
                <p className="text-sm">
                  Suggestion prompts fade in with 50ms delay between each
                </p>
              </div>
            </div>
          </div>

          {/* Extra content for scrolling demonstration */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold font-['Poppins'] text-[#161a1a] mb-4">
              Sample Content
            </h2>
            <p className="text-[#5a5f5e] font-['Poppins'] mb-4">
              This section demonstrates that the ChatBar stays anchored to the
              bottom while scrolling through page content.
            </p>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 bg-[#fafafa] rounded-xl">
                  <div className="h-4 w-3/4 bg-[#e5e7e7] rounded mb-2" />
                  <div className="h-4 w-1/2 bg-[#e5e7e7] rounded" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* The ChatBar component - anchored to viewport bottom */}
      <ChatBar />
    </div>
  )
}
