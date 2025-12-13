/**
 * Design System Page
 *
 * A comprehensive page showcasing all components in the Bips design system.
 * Organized by component category with interactive examples.
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MetricCard } from '@/components/overview/MetricCard'
import { DateRangeSelector } from '@/components/overview/DateRangeSelector'
import { SpendingList } from '@/components/overview/SpendingList'
import { ActionButton } from '@/components/overview/ActionButton'
import { AssistantInput } from '@/components/overview/AssistantInput'
import ChatBar from '@/components/ChatBar'
import { ChevronDown, FileText, Mail, Sparkles, Settings, User, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'

const spendingData = [
  { category: 'Equipment', percentage: 28, color: '#2D7A4B' },
  { category: 'Payroll', percentage: 24, color: '#3182CE' },
  { category: 'Marketing', percentage: 18, color: '#D97706' },
  { category: 'Software', percentage: 15, color: '#7C3AED' },
  { category: 'Office', percentage: 15, color: '#EC4899' },
]

export default function Design() {
  const [inputValue, setInputValue] = useState('')

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[var(--color-neutral-g-200)]">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <svg width="21" height="27" viewBox="0 0 21 27" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6.63313" cy="20.0711" r="6.02962" fill="#467C75"/>
              <circle cx="15.191" cy="8.95953" r="5.0816" fill="#467C75"/>
              <circle cx="3.87806" cy="3.87806" r="3.87806" fill="#467C75"/>
            </svg>
            <h1 className="text-2xl font-semibold font-['Poppins'] text-[var(--color-neutral-n-800)]">
              Design System
            </h1>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="text-[var(--color-neutral-n-700)] hover:text-[var(--color-neutral-n-800)] font-['Poppins'] text-sm"
            >
              ChatBar Demo
            </Link>
            <Link
              to="/dashboard"
              className="text-[var(--color-neutral-n-700)] hover:text-[var(--color-neutral-n-800)] font-['Poppins'] text-sm"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 pb-32 space-y-16">
        {/* Color Tokens */}
        <section>
          <h2 className="text-xl font-semibold font-['Poppins'] text-[var(--color-neutral-n-800)] mb-6">
            Color Tokens
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Primary', var: '--color-primary-p-500', hex: '#467c75' },
              { name: 'N-800', var: '--color-neutral-n-800', hex: '#161a1a' },
              { name: 'N-700', var: '--color-neutral-n-700', hex: '#5a5f5e' },
              { name: 'N-600', var: '--color-neutral-n-600', hex: '#8d9291' },
              { name: 'G-400', var: '--color-neutral-g-400', hex: '#c1c5c5' },
              { name: 'G-200', var: '--color-neutral-g-200', hex: '#e5e7e7' },
              { name: 'G-100', var: '--color-neutral-g-100', hex: '#f1f2f2' },
              { name: 'G-50', var: '--color-neutral-g-50', hex: '#fafafa' },
              { name: 'White', var: '--color-white', hex: '#ffffff' },
            ].map((color) => (
              <div key={color.name} className="space-y-2">
                <div
                  className="w-full h-16 rounded-lg border border-[var(--color-neutral-g-200)]"
                  style={{ backgroundColor: `var(${color.var})` }}
                />
                <p className="text-sm font-medium font-['Poppins'] text-[var(--color-neutral-n-800)]">
                  {color.name}
                </p>
                <p className="text-xs font-['Poppins'] text-[var(--color-neutral-n-600)]">
                  {color.hex}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Typography */}
        <section>
          <h2 className="text-xl font-semibold font-['Poppins'] text-[var(--color-neutral-n-800)] mb-6">
            Typography
          </h2>
          <div className="space-y-6 bg-white rounded-2xl p-6">
            <div>
              <p className="text-xs text-[var(--color-neutral-n-600)] mb-1">Heading 1 - 32px</p>
              <h1 className="text-[32px] font-semibold font-['Poppins'] text-[var(--color-neutral-n-800)]">
                The quick brown fox jumps
              </h1>
            </div>
            <div>
              <p className="text-xs text-[var(--color-neutral-n-600)] mb-1">Heading 2 - 24px</p>
              <h2 className="text-2xl font-semibold font-['Poppins'] text-[var(--color-neutral-n-800)]">
                The quick brown fox jumps
              </h2>
            </div>
            <div>
              <p className="text-xs text-[var(--color-neutral-n-600)] mb-1">Heading 3 - 20px</p>
              <h3 className="text-xl font-semibold font-['Poppins'] text-[var(--color-neutral-n-800)]">
                The quick brown fox jumps
              </h3>
            </div>
            <div>
              <p className="text-xs text-[var(--color-neutral-n-600)] mb-1">Body - 16px</p>
              <p className="text-base font-['Poppins'] text-[var(--color-neutral-n-700)]">
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-neutral-n-600)] mb-1">Small - 14px</p>
              <p className="text-sm font-['Poppins'] text-[var(--color-neutral-n-700)]">
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          </div>
        </section>

        <Separator />

        {/* Buttons */}
        <section>
          <h2 className="text-xl font-semibold font-['Poppins'] text-[var(--color-neutral-n-800)] mb-6">
            Buttons
          </h2>
          <div className="bg-white rounded-2xl p-6 space-y-6">
            <div className="flex flex-wrap gap-4 items-center">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
        </section>

        <Separator />

        {/* Inputs */}
        <section>
          <h2 className="text-xl font-semibold font-['Poppins'] text-[var(--color-neutral-n-800)] mb-6">
            Inputs
          </h2>
          <div className="bg-white rounded-2xl p-6 space-y-4 max-w-md">
            <Input placeholder="Default input" />
            <Input placeholder="With value" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            <Input placeholder="Disabled input" disabled />
          </div>
        </section>

        <Separator />

        {/* Cards */}
        <section>
          <h2 className="text-xl font-semibold font-['Poppins'] text-[var(--color-neutral-n-800)] mb-6">
            Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description text goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--color-neutral-n-700)]">Card content area</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Another Card</CardTitle>
                <CardDescription>With some different content</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Action Button</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Loading State</CardTitle>
                <CardDescription>Skeleton placeholders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Dropdown Menu */}
        <section>
          <h2 className="text-xl font-semibold font-['Poppins'] text-[var(--color-neutral-n-800)] mb-6">
            Dropdown Menu
          </h2>
          <div className="bg-white rounded-2xl p-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  Options <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </section>

        <Separator />

        {/* Tooltips */}
        <section>
          <h2 className="text-xl font-semibold font-['Poppins'] text-[var(--color-neutral-n-800)] mb-6">
            Tooltips
          </h2>
          <div className="bg-white rounded-2xl p-6">
            <TooltipProvider>
              <div className="flex gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Hover me</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tooltip content</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Another tooltip</Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>This appears below</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </section>

        <Separator />

        {/* Dashboard Components */}
        <section>
          <h2 className="text-xl font-semibold font-['Poppins'] text-[var(--color-neutral-n-800)] mb-6">
            Dashboard Components
          </h2>

          {/* Date Range Selector */}
          <div className="mb-8">
            <h3 className="text-base font-medium font-['Poppins'] text-[var(--color-neutral-n-700)] mb-4">
              Date Range Selector
            </h3>
            <div className="bg-white rounded-2xl p-6">
              <DateRangeSelector />
            </div>
          </div>

          {/* Metric Cards */}
          <div className="mb-8">
            <h3 className="text-base font-medium font-['Poppins'] text-[var(--color-neutral-n-700)] mb-4">
              Metric Cards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                label="Income"
                value="$26,231"
                onTellMeMore={() => console.log('Tell me more')}
              />
              <MetricCard
                label="Costs"
                value="$18,450"
                onTellMeMore={() => console.log('Tell me more')}
              />
              <MetricCard
                label="Cash on Hand"
                value="$42,890"
                onTellMeMore={() => console.log('Tell me more')}
              />
            </div>
          </div>

          {/* Spending List */}
          <div className="mb-8">
            <h3 className="text-base font-medium font-['Poppins'] text-[var(--color-neutral-n-700)] mb-4">
              Spending List
            </h3>
            <div className="max-w-md">
              <SpendingList items={spendingData} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-8">
            <h3 className="text-base font-medium font-['Poppins'] text-[var(--color-neutral-n-700)] mb-4">
              Action Buttons
            </h3>
            <div className="bg-white rounded-2xl p-6">
              <div className="flex flex-wrap gap-3">
                <ActionButton
                  icon={FileText}
                  label="Generate P&L Report"
                  onClick={() => console.log('Generate report')}
                />
                <ActionButton
                  icon={Mail}
                  label="Review Transactions"
                  onClick={() => console.log('Review transactions')}
                />
                <ActionButton
                  icon={Sparkles}
                  label="View Insights"
                  onClick={() => console.log('View insights')}
                />
              </div>
            </div>
          </div>

          {/* Assistant Input */}
          <div>
            <h3 className="text-base font-medium font-['Poppins'] text-[var(--color-neutral-n-700)] mb-4">
              Assistant Input
            </h3>
            <div className="bg-white rounded-2xl p-6 max-w-2xl">
              <AssistantInput
                onSend={(message) => console.log('Message:', message)}
                onAttach={() => console.log('Attach')}
              />
            </div>
          </div>
        </section>

        <Separator />

        {/* Shadows */}
        <section>
          <h2 className="text-xl font-semibold font-['Poppins'] text-[var(--color-neutral-n-800)] mb-6">
            Shadows
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8" style={{ boxShadow: 'var(--shadow-small)' }}>
              <p className="font-medium font-['Poppins'] text-[var(--color-neutral-n-800)]">Shadow Small</p>
              <p className="text-sm text-[var(--color-neutral-n-600)]">--shadow-small</p>
            </div>
            <div className="bg-white rounded-2xl p-8" style={{ boxShadow: 'var(--shadow-large)' }}>
              <p className="font-medium font-['Poppins'] text-[var(--color-neutral-n-800)]">Shadow Large</p>
              <p className="text-sm text-[var(--color-neutral-n-600)]">--shadow-large</p>
            </div>
            <div
              className="bg-white rounded-2xl p-8 border border-[var(--color-primary-p-500)]"
              style={{ boxShadow: 'var(--shadow-input-focus)' }}
            >
              <p className="font-medium font-['Poppins'] text-[var(--color-neutral-n-800)]">Input Focus</p>
              <p className="text-sm text-[var(--color-neutral-n-600)]">--shadow-input-focus</p>
            </div>
          </div>
        </section>

        <Separator />

        {/* Border Radius */}
        <section>
          <h2 className="text-xl font-semibold font-['Poppins'] text-[var(--color-neutral-n-800)] mb-6">
            Border Radius
          </h2>
          <div className="flex flex-wrap gap-6 items-end">
            {[
              { name: '8px', var: '--radius-8' },
              { name: '12px', var: '--radius-12' },
              { name: '16px', var: '--radius-16' },
              { name: '32px', var: '--radius-32' },
              { name: 'Full', var: '--radius-full' },
            ].map((radius) => (
              <div key={radius.name} className="text-center">
                <div
                  className="w-20 h-20 bg-[var(--color-primary-p-500)]"
                  style={{ borderRadius: `var(${radius.var})` }}
                />
                <p className="mt-2 text-sm font-['Poppins'] text-[var(--color-neutral-n-700)]">
                  {radius.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Spacing */}
        <section>
          <h2 className="text-xl font-semibold font-['Poppins'] text-[var(--color-neutral-n-800)] mb-6">
            Spacing
          </h2>
          <div className="bg-white rounded-2xl p-6 space-y-4">
            {[
              { name: '4px', var: '--space-4' },
              { name: '8px', var: '--space-8' },
              { name: '12px', var: '--space-12' },
              { name: '16px', var: '--space-16' },
              { name: '20px', var: '--space-20' },
              { name: '24px', var: '--space-24' },
              { name: '32px', var: '--space-32' },
            ].map((space) => (
              <div key={space.name} className="flex items-center gap-4">
                <div
                  className="h-4 bg-[var(--color-primary-p-500)] rounded"
                  style={{ width: `var(${space.var})` }}
                />
                <span className="text-sm font-['Poppins'] text-[var(--color-neutral-n-700)]">
                  {space.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ChatBar */}
      <ChatBar />
    </div>
  )
}
