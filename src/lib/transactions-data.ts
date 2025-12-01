// Transaction Types and Mock Data

export interface Account {
  id: string
  name: string
  institution: string
  type: 'checking' | 'savings' | 'credit' | 'investment'
  lastFour: string
}

export interface Category {
  id: string
  name: string
  color: string
  emoji: string
  parentId?: string // For subcategories
  isHidden?: boolean // Hidden categories (personal expenses, internal transfers, etc.)
}

export interface Tag {
  id: string
  name: string
  color: string
}

export type TransactionStatus = 'pending' | 'posted'
export type CategorySource = 'ai' | 'manual' | 'rule'

export interface Transaction {
  id: string
  date: string // ISO date string
  merchant: string
  description: string
  amount: number // Negative for expenses, positive for income
  accountId: string
  categoryId: string | null
  categorySource: CategorySource
  status: TransactionStatus
  notes: string
  isDeleted: boolean // Soft delete
  isHidden: boolean // Hidden from reports
  // For split transactions (v2)
  parentId?: string
  splitParts?: Array<{
    categoryId: string
    amount: number
    notes?: string
  }>
  // For merged transactions (v2)
  mergedFromIds?: string[]
  createdAt: string
  updatedAt: string
}

// Mock Accounts
export const mockAccounts: Account[] = [
  {
    id: 'acc_1',
    name: 'Business Checking',
    institution: 'Chase',
    type: 'checking',
    lastFour: '4521',
  },
  {
    id: 'acc_2',
    name: 'Business Savings',
    institution: 'Chase',
    type: 'savings',
    lastFour: '8832',
  },
  {
    id: 'acc_3',
    name: 'Business Platinum',
    institution: 'American Express',
    type: 'credit',
    lastFour: '1004',
  },
  {
    id: 'acc_4',
    name: 'Operating Account',
    institution: 'Mercury',
    type: 'checking',
    lastFour: '7789',
  },
]

// Mock Categories
export const mockCategories: Category[] = [
  // Business categories (visible by default)
  { id: 'cat_1', name: 'Payroll', color: '#2D7A4B', emoji: '💰' },
  { id: 'cat_2', name: 'Software & SaaS', color: '#3B6B8C', emoji: '💻' },
  { id: 'cat_3', name: 'Marketing', color: '#8B5A2B', emoji: '📢' },
  { id: 'cat_4', name: 'Office Supplies', color: '#6B5B95', emoji: '📎' },
  { id: 'cat_5', name: 'Travel', color: '#D4A574', emoji: '✈️' },
  { id: 'cat_6', name: 'Meals & Entertainment', color: '#E07A5F', emoji: '🍔' },
  { id: 'cat_7', name: 'Professional Services', color: '#4A7C59', emoji: '👔' },
  { id: 'cat_8', name: 'Equipment', color: '#5C6B73', emoji: '🖥️' },
  { id: 'cat_9', name: 'Utilities', color: '#9B8B7A', emoji: '⚡' },
  { id: 'cat_10', name: 'Insurance', color: '#7A8B99', emoji: '🛡️' },
  { id: 'cat_11', name: 'Revenue', color: '#2a4a47', emoji: '💵' },
  { id: 'cat_12', name: 'Refund', color: '#4A9D8E', emoji: '↩️' },
  { id: 'cat_uncategorized', name: 'Uncategorized', color: '#8d9291', emoji: '❓' },
  // Hidden categories (personal/non-business)
  { id: 'cat_personal', name: 'Personal Expenses', color: '#A0522D', emoji: '🏠', isHidden: true },
  { id: 'cat_cc_payment', name: 'Credit Card Payment', color: '#708090', emoji: '💳', isHidden: true },
  { id: 'cat_internal', name: 'Internal Transfer', color: '#4682B4', emoji: '🔄', isHidden: true },
  { id: 'cat_owner_draw', name: 'Owner Draw', color: '#8B4513', emoji: '👤', isHidden: true },
  { id: 'cat_loan', name: 'Loan Payment', color: '#556B2F', emoji: '🏦', isHidden: true },
]

// Mock Tags
export const mockTags: Tag[] = [
  { id: 'tag_1', name: 'Tax-deductible', color: '#2D7A4B' },
  { id: 'tag_2', name: 'Reimbursable', color: '#3B6B8C' },
  { id: 'tag_3', name: 'Client: Acme Co.', color: '#8B5A2B' },
  { id: 'tag_4', name: 'Client: TechCorp', color: '#6B5B95' },
  { id: 'tag_5', name: 'Recurring', color: '#5C6B73' },
  { id: 'tag_6', name: 'One-time', color: '#9B8B7A' },
]

// Merchant data for generating realistic transactions
const merchants = [
  // Software & SaaS
  { name: 'AWS', category: 'cat_2', amountRange: [50, 2500] },
  { name: 'Google Cloud', category: 'cat_2', amountRange: [100, 1500] },
  { name: 'Slack Technologies', category: 'cat_2', amountRange: [50, 200] },
  { name: 'Notion Labs', category: 'cat_2', amountRange: [20, 100] },
  { name: 'Figma', category: 'cat_2', amountRange: [15, 75] },
  { name: 'GitHub', category: 'cat_2', amountRange: [20, 100] },
  { name: 'Vercel', category: 'cat_2', amountRange: [20, 100] },
  { name: 'Linear', category: 'cat_2', amountRange: [10, 50] },

  // Marketing
  { name: 'Google Ads', category: 'cat_3', amountRange: [500, 5000] },
  { name: 'Meta Ads', category: 'cat_3', amountRange: [300, 3000] },
  { name: 'LinkedIn Marketing', category: 'cat_3', amountRange: [200, 2000] },
  { name: 'Mailchimp', category: 'cat_3', amountRange: [50, 300] },

  // Office Supplies
  { name: 'Amazon Business', category: 'cat_4', amountRange: [20, 500] },
  { name: 'Staples', category: 'cat_4', amountRange: [30, 200] },
  { name: 'Office Depot', category: 'cat_4', amountRange: [25, 150] },

  // Travel
  { name: 'United Airlines', category: 'cat_5', amountRange: [200, 1500] },
  { name: 'Delta Air Lines', category: 'cat_5', amountRange: [250, 1200] },
  { name: 'Marriott Hotels', category: 'cat_5', amountRange: [150, 500] },
  { name: 'Hilton Hotels', category: 'cat_5', amountRange: [120, 450] },
  { name: 'Uber', category: 'cat_5', amountRange: [15, 80] },
  { name: 'Lyft', category: 'cat_5', amountRange: [12, 70] },

  // Meals & Entertainment
  { name: 'DoorDash', category: 'cat_6', amountRange: [20, 100] },
  { name: 'Grubhub', category: 'cat_6', amountRange: [25, 90] },
  { name: 'Starbucks', category: 'cat_6', amountRange: [5, 30] },
  { name: 'Chipotle', category: 'cat_6', amountRange: [12, 50] },
  { name: 'Sweetgreen', category: 'cat_6', amountRange: [15, 40] },

  // Professional Services
  { name: 'Gusto Payroll', category: 'cat_1', amountRange: [5000, 50000] },
  { name: 'QuickBooks', category: 'cat_7', amountRange: [30, 150] },
  { name: 'Law Offices of Smith & Co', category: 'cat_7', amountRange: [500, 5000] },
  { name: 'Anderson CPA', category: 'cat_7', amountRange: [300, 2000] },

  // Equipment
  { name: 'Apple Store', category: 'cat_8', amountRange: [100, 3000] },
  { name: 'Best Buy Business', category: 'cat_8', amountRange: [50, 1500] },
  { name: 'Dell Technologies', category: 'cat_8', amountRange: [500, 2500] },

  // Utilities
  { name: 'Comcast Business', category: 'cat_9', amountRange: [100, 300] },
  { name: 'AT&T Business', category: 'cat_9', amountRange: [80, 250] },
  { name: 'PG&E', category: 'cat_9', amountRange: [150, 500] },

  // Insurance
  { name: 'State Farm', category: 'cat_10', amountRange: [200, 800] },
  { name: 'Hartford Insurance', category: 'cat_10', amountRange: [300, 1000] },

  // Revenue (positive amounts)
  { name: 'Customer Payment', category: 'cat_11', amountRange: [1000, 25000], isIncome: true },
  { name: 'Stripe Payout', category: 'cat_11', amountRange: [500, 15000], isIncome: true },
  { name: 'Invoice Payment', category: 'cat_11', amountRange: [2000, 50000], isIncome: true },

  // Refunds
  { name: 'Amazon Refund', category: 'cat_12', amountRange: [20, 200], isIncome: true },
]

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(startDays: number, endDays: number): string {
  const now = new Date()
  const daysAgo = randomBetween(startDays, endDays)
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
  return date.toISOString().split('T')[0]
}

function generateId(): string {
  return 'txn_' + Math.random().toString(36).substring(2, 11)
}

function generateTransaction(): Transaction {
  const merchant = merchants[randomBetween(0, merchants.length - 1)]
  const account = mockAccounts[randomBetween(0, mockAccounts.length - 1)]
  const amount = randomBetween(merchant.amountRange[0], merchant.amountRange[1])
  const isIncome = 'isIncome' in merchant && merchant.isIncome

  // 80% of transactions are AI-categorized, 15% manual, 5% uncategorized
  const categoryRoll = Math.random()
  let categoryId: string | null
  let categorySource: CategorySource

  if (categoryRoll < 0.05) {
    categoryId = null
    categorySource = 'ai'
  } else if (categoryRoll < 0.20) {
    categoryId = merchant.category
    categorySource = 'manual'
  } else {
    categoryId = merchant.category
    categorySource = 'ai'
  }

  // 90% posted, 10% pending
  const status: TransactionStatus = Math.random() < 0.9 ? 'posted' : 'pending'

  // 15% chance of having notes
  const notes = Math.random() < 0.15
    ? ['Team lunch meeting', 'Q4 planning session', 'Client presentation', 'Monthly subscription', 'One-time purchase'][randomBetween(0, 4)]
    : ''

  const date = randomDate(0, 90) // Last 90 days

  return {
    id: generateId(),
    date,
    merchant: merchant.name,
    description: `${merchant.name} - ${isIncome ? 'Payment received' : 'Purchase'}`,
    amount: isIncome ? amount : -amount,
    accountId: account.id,
    categoryId,
    categorySource,
    status,
    notes,
    isDeleted: false,
    isHidden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// Generate 75 mock transactions
export const mockTransactions: Transaction[] = Array.from(
  { length: 75 },
  () => generateTransaction()
).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

// Helper functions
export function getAccountById(id: string): Account | undefined {
  return mockAccounts.find(acc => acc.id === id)
}

export function getCategoryById(id: string | null): Category | undefined {
  if (!id) return mockCategories.find(c => c.id === 'cat_uncategorized')
  return mockCategories.find(cat => cat.id === id)
}

export function getTagById(id: string): Tag | undefined {
  return mockTags.find(tag => tag.id === id)
}

export function formatCurrency(amount: number): string {
  const absAmount = Math.abs(amount)
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(absAmount)
  return amount < 0 ? `-${formatted}` : `+${formatted}`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
