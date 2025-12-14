/**
 * Settings Modal Component
 *
 * A modal with three tabs:
 * - Account: User profile settings
 * - Company: Company information
 * - Accounts: Bank account connections
 */

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  UserRound,
  Briefcase,
  Landmark,
  ExternalLink,
  X,
  RefreshCw,
  Check,
  MoreVertical,
  Plus,
  Laptop,
  Trash2,
  Pencil,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import PlaidLogo from '@/assets/Plaid.svg'
import { InlineMessage } from '@/components/ui/inline-message'

type SettingsTab = 'account' | 'company' | 'accounts'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Pied Piper logo component
function PiedPiperLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-[10px]',
    md: 'w-14 h-14 text-[12px]',
    lg: 'w-[77px] h-[77px] text-[14px]',
  }

  return (
    <div className={`${sizeClasses[size]} bg-[#2E7D32] rounded-full border-2 border-[var(--color-neutral-g-200)] flex flex-col items-center justify-center text-white font-bold`}>
      <span className="text-[1.4em] leading-none">Pp</span>
      <span className="text-[0.45em] leading-none mt-0.5">pied piper</span>
    </div>
  )
}

// Initial values for change detection
const initialAccountValues = {
  firstName: 'Preston',
  lastName: 'Booth',
  email: 'pbooth@piedpiper.com',
}

const initialCompanyValues = {
  companyName: 'Pied Piper',
  companyWebsite: 'www.piedpiper.com',
  industry: 'technology',
  teamSize: '1-5',
  companyDetails: 'Pied piper is a technology company specializing in compression algorithms.',
  goals: {
    clearPicture: true,
    moreProfitable: true,
    cashFlow: false,
    smarterDecisions: false,
  },
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')

  // Account form state
  const [firstName, setFirstName] = useState(initialAccountValues.firstName)
  const [lastName, setLastName] = useState(initialAccountValues.lastName)
  const [email, setEmail] = useState(initialAccountValues.email)

  // Company form state
  const [companyName, setCompanyName] = useState(initialCompanyValues.companyName)
  const [companyWebsite, setCompanyWebsite] = useState(initialCompanyValues.companyWebsite)
  const [industry, setIndustry] = useState(initialCompanyValues.industry)
  const [teamSize, setTeamSize] = useState(initialCompanyValues.teamSize)
  const [companyDetails, setCompanyDetails] = useState(initialCompanyValues.companyDetails)
  const [goals, setGoals] = useState(initialCompanyValues.goals)

  // Check if account form has changes
  const hasAccountChanges =
    firstName !== initialAccountValues.firstName ||
    lastName !== initialAccountValues.lastName ||
    email !== initialAccountValues.email

  // Check if company form has changes
  const hasCompanyChanges =
    companyName !== initialCompanyValues.companyName ||
    companyWebsite !== initialCompanyValues.companyWebsite ||
    industry !== initialCompanyValues.industry ||
    teamSize !== initialCompanyValues.teamSize ||
    companyDetails !== initialCompanyValues.companyDetails ||
    goals.clearPicture !== initialCompanyValues.goals.clearPicture ||
    goals.moreProfitable !== initialCompanyValues.goals.moreProfitable ||
    goals.cashFlow !== initialCompanyValues.goals.cashFlow ||
    goals.smarterDecisions !== initialCompanyValues.goals.smarterDecisions

  const tabs = [
    { id: 'account' as const, label: 'Account', icon: UserRound },
    { id: 'company' as const, label: 'Company', icon: Briefcase },
    { id: 'accounts' as const, label: 'Accounts', icon: Landmark },
  ]

  const connectedAccounts = [
    {
      id: '1',
      name: 'Chase Business Checking Account',
      lastFour: '1883',
      balance: 8110.41,
      status: 'reconnect' as const,
      lastUpdated: '12 Days Ago',
    },
    {
      id: '2',
      name: 'Chase Business Checking Account',
      lastFour: '1883',
      balance: 26820.32,
      status: 'linked' as const,
      lastUpdated: '14 Minutes Ago',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1000px] h-[627px] p-0 gap-0 overflow-hidden border border-[var(--color-neutral-g-100)] rounded-2xl">
        <div className="flex h-full">
          {/* Left Sidebar */}
          <div className="w-[260px] p-[10px] pr-0">
            <div className="h-full bg-[var(--color-neutral-g-50)] rounded-xl flex flex-col p-3">
              <div className="flex-1 space-y-0.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-[14px] transition-colors ${
                        isActive
                          ? 'bg-[var(--color-neutral-g-100)] text-[var(--color-neutral-n-800)] font-semibold'
                          : 'text-[var(--color-neutral-n-800)] font-medium hover:bg-[var(--color-neutral-g-100)]/50'
                      }`}
                    >
                      <Icon className="w-[18px] h-[18px]" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* Manage Subscription Link */}
              <button className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-[var(--color-neutral-n-800)] hover:bg-[var(--color-neutral-g-100)]/50 rounded-full transition-colors whitespace-nowrap">
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                Manage Your Subscription
              </button>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 relative overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-3 right-4 w-9 h-9 rounded-full bg-[var(--color-neutral-g-100)] flex items-center justify-center hover:bg-[var(--color-neutral-g-200)] transition-colors z-10"
            >
              <X className="w-5 h-5 text-[var(--color-neutral-n-600)]" />
            </button>

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="p-10 pt-10">
                <h2 className="text-[22px] font-medium text-[var(--color-neutral-n-800)] mb-5 tracking-[-0.44px]">
                  Account Settings
                </h2>

                {/* Avatar */}
                <div className="w-[77px] h-[77px] rounded-full bg-[var(--color-neutral-n-800)] flex items-center justify-center text-white text-[24px] font-semibold mb-5">
                  PB
                </div>

                {/* Form */}
                <div className="space-y-6 max-w-[647px]">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[15px] text-[var(--color-neutral-n-800)] tracking-[-0.3px]">
                        First Name
                      </Label>
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[15px] text-[var(--color-neutral-n-800)] tracking-[-0.3px]">
                        Last Name
                      </Label>
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[15px] text-[var(--color-neutral-n-800)] tracking-[-0.3px]">
                      Email
                    </Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 max-w-[317px]"
                    />
                  </div>

                  <button
                    disabled={!hasAccountChanges}
                    className={`px-4 py-3 rounded-full text-[14px] tracking-[-0.28px] transition-colors ${
                      hasAccountChanges
                        ? 'bg-[var(--color-neutral-n-800)] text-[var(--color-neutral-g-50)]'
                        : 'bg-[var(--color-neutral-g-100)] text-[var(--color-neutral-n-400)] cursor-not-allowed'
                    }`}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Company Tab */}
            {activeTab === 'company' && (
              <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 overflow-y-auto p-8 pt-8 pb-28">
                  <h2 className="text-[22px] font-medium text-[var(--color-neutral-n-800)] mb-5 tracking-[-0.44px]">
                    Company Settings
                  </h2>

                  {/* Company Logo */}
                  <div className="mb-5">
                    <PiedPiperLogo size="lg" />
                  </div>

                  {/* Form */}
                  <div className="space-y-5 max-w-[600px]">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[14px] text-[var(--color-neutral-n-600)] tracking-[-0.28px]">
                          Company Name
                        </Label>
                        <Input
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[14px] text-[var(--color-neutral-n-600)] tracking-[-0.28px]">
                          Company Website
                        </Label>
                        <Input
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                          className="h-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[14px] text-[var(--color-neutral-n-600)] tracking-[-0.28px]">
                          Industry
                        </Label>
                        <Select value={industry} onValueChange={setIndustry}>
                          <SelectTrigger className="h-10">
                            <div className="flex items-center gap-2">
                              <Laptop className="w-5 h-5 text-muted-foreground" />
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[14px] text-[var(--color-neutral-n-600)] tracking-[-0.28px]">
                          Team Size
                        </Label>
                        <Select value={teamSize} onValueChange={setTeamSize}>
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-5">1-5 Employees</SelectItem>
                            <SelectItem value="6-20">6-20 Employees</SelectItem>
                            <SelectItem value="21-50">21-50 Employees</SelectItem>
                            <SelectItem value="51-100">51-100 Employees</SelectItem>
                            <SelectItem value="100+">100+ Employees</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[14px] text-[var(--color-neutral-n-600)] tracking-[-0.28px]">
                        Company Details
                      </Label>
                      <Textarea
                        value={companyDetails}
                        onChange={(e) => setCompanyDetails(e.target.value)}
                        className="min-h-[160px] resize-y text-[14px]"
                      />
                    </div>

                    {/* Goals Section */}
                    <div className="space-y-3">
                      <Label className="text-[14px] text-[var(--color-neutral-n-600)] tracking-[-0.28px]">
                        Goals
                      </Label>
                      <div className="space-y-2.5">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={goals.clearPicture}
                            onChange={(e) => setGoals({ ...goals, clearPicture: e.target.checked })}
                            className="w-5 h-5 rounded border-[var(--color-neutral-g-200)] accent-[var(--color-neutral-n-800)] focus:ring-[var(--color-neutral-n-800)]"
                          />
                          <span className="text-[14px] text-[var(--color-neutral-n-700)]">
                            Get a clear picture of my finances
                          </span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={goals.moreProfitable}
                            onChange={(e) => setGoals({ ...goals, moreProfitable: e.target.checked })}
                            className="w-5 h-5 rounded border-[var(--color-neutral-g-200)] accent-[var(--color-neutral-n-800)] focus:ring-[var(--color-neutral-n-800)]"
                          />
                          <span className="text-[14px] text-[var(--color-neutral-n-700)]">
                            Discover ways to be more profitable
                          </span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={goals.cashFlow}
                            onChange={(e) => setGoals({ ...goals, cashFlow: e.target.checked })}
                            className="w-5 h-5 rounded border-[var(--color-neutral-g-200)] accent-[var(--color-neutral-n-800)] focus:ring-[var(--color-neutral-n-800)]"
                          />
                          <span className="text-[14px] text-[var(--color-neutral-n-700)]">
                            Stay on top of cash flow
                          </span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={goals.smarterDecisions}
                            onChange={(e) => setGoals({ ...goals, smarterDecisions: e.target.checked })}
                            className="w-5 h-5 rounded border-[var(--color-neutral-g-200)] accent-[var(--color-neutral-n-800)] focus:ring-[var(--color-neutral-n-800)]"
                          />
                          <span className="text-[14px] text-[var(--color-neutral-n-700)]">
                            Make smarter, faster business decisions
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Gradient Fade with Fixed Save Button */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-[140px] z-10"
                  style={{ background: 'linear-gradient(to top, white 0%, white 40%, rgba(255,255,255,0.8) 60%, rgba(255,255,255,0.4) 80%, transparent 100%)' }}
                >
                  <button
                    disabled={!hasCompanyChanges}
                    className={`absolute left-8 bottom-8 px-4 py-3 rounded-full text-[14px] tracking-[-0.28px] transition-colors ${
                      hasCompanyChanges
                        ? 'bg-[var(--color-neutral-n-800)] text-[var(--color-neutral-g-50)]'
                        : 'bg-[var(--color-neutral-g-100)] text-[var(--color-neutral-n-400)] cursor-not-allowed'
                    }`}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Accounts Tab */}
            {activeTab === 'accounts' && (
              <div className="p-8 pt-8 pr-16">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[22px] font-medium text-[var(--color-neutral-n-800)] tracking-[-0.44px]">
                    {connectedAccounts.length} Connected Accounts
                  </h2>
                  <button className="flex items-center gap-2 text-[14px] text-[var(--color-neutral-n-600)] hover:text-[var(--color-neutral-n-800)] transition-colors">
                    <Plus className="w-4 h-4" />
                    Connect Another Account
                  </button>
                </div>

                {/* Plaid Notice */}
                <InlineMessage iconSrc={PlaidLogo} iconAlt="Plaid" className="mb-4">
                  Your accounts are securely connected through Plaid.
                </InlineMessage>

                {/* Account Cards */}
                <div className="space-y-3">
                  {connectedAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-4 border border-[var(--color-neutral-g-200)] rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        {/* Status Badge */}
                        {account.status === 'reconnect' ? (
                          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--color-neutral-g-200)] rounded-full text-[12px] text-[var(--color-neutral-n-600)] hover:bg-[var(--color-neutral-g-50)] transition-colors">
                            <RefreshCw className="w-3 h-3" />
                            Reconnect
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F5E9] rounded-full text-[12px] text-[#2E7D32]">
                            <Check className="w-3 h-3" />
                            Linked
                          </div>
                        )}
                        <div>
                          <p className="text-[14px] font-medium text-[var(--color-neutral-n-800)]">
                            {account.name}
                          </p>
                          <p className="text-[12px] text-[var(--color-neutral-n-500)]">
                            ****{account.lastFour}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Balance */}
                        <div className="text-right min-w-[100px]">
                          <p className="text-[12px] text-[var(--color-neutral-n-500)]">
                            Balance
                          </p>
                          <p className="text-[16px] font-semibold text-[var(--color-neutral-n-800)]">
                            ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-[11px] text-[var(--color-neutral-n-400)]">
                            Last Updated {account.lastUpdated}
                          </p>
                        </div>

                        {/* More Options Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 hover:bg-[var(--color-neutral-g-100)] rounded transition-colors">
                              <MoreVertical className="w-4 h-4 text-[var(--color-neutral-n-500)]" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Pencil className="w-4 h-4" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer text-red-600 focus:text-red-600">
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Privacy Notice */}
                <div className="mt-6 space-y-2">
                  <p className="text-[13px] text-[var(--color-neutral-n-700)]">
                    Bips never stores your bank credentials, and you can remove an account and its data at any time.
                  </p>
                  <p className="text-[12px] text-[var(--color-neutral-n-500)]">
                    If you don't see your financial institution as an offered connection please email{' '}
                    <a href="mailto:support@trybips.com" className="text-[var(--color-primary-p-500)] hover:underline">
                      support@trybips.com
                    </a>
                    .
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
