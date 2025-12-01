# Overview Page - Component Structure

This document outlines the complete component architecture for the Overview page, designed based on the Figma specifications with a focus on reusability and clean organization.

## 🎯 Design Goals

1. **Reusability** - All components are self-contained and can be used in other projects
2. **Clean Organization** - Components are logically grouped in the `overview/` directory
3. **Type Safety** - Full TypeScript support with proper interfaces
4. **Responsive** - Mobile-first design with responsive breakpoints
5. **Maintainability** - Clear component boundaries and documentation

## 📁 Project Structure

```
src/
├── components/
│   ├── overview/                    # ✨ New reusable components
│   │   ├── MetricCard.tsx          # Revenue/Costs/Cash cards
│   │   ├── DateRangeSelector.tsx   # Date picker with view toggles
│   │   ├── PerformanceChart.tsx    # Multi-line chart visualization
│   │   ├── SpendingList.tsx        # Container for spending items
│   │   ├── SpendingListItem.tsx    # Individual spending row
│   │   ├── ActionButton.tsx        # Styled action buttons
│   │   ├── AssistantInput.tsx      # Chat-style input field
│   │   ├── index.ts                # Barrel exports
│   │   └── README.md               # Complete documentation
│   │
│   ├── pages/
│   │   └── Overview.tsx            # ✨ Updated main page
│   │
│   └── ui/                          # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── chart.tsx
│       └── ...
```

## 🧩 Component Hierarchy

```
Overview Page
├── DateRangeSelector
│   ├── Date Dropdown (August 2025)
│   └── View Toggles (Month/Quarter/Year)
│
├── Metrics Row (Grid: 3 columns)
│   ├── MetricCard (Revenue)
│   ├── MetricCard (Costs)
│   └── MetricCard (Cash on Hand)
│
├── Main Content (Grid: 2:1 ratio)
│   ├── PerformanceChart (2 columns)
│   │   └── LineChart (Recharts)
│   │       ├── Revenue Line
│   │       ├── Costs Line
│   │       └── Cash Line
│   │
│   └── SpendingList (1 column)
│       ├── Header (with % / $ toggles)
│       └── SpendingListItem (x8)
│           ├── Category Dot
│           ├── Category Name
│           ├── Progress Bar
│           └── Percentage
│
├── Action Buttons Row
│   ├── ActionButton (Generate P&L Report)
│   ├── ActionButton (Review Transactions)
│   └── ActionButton (View Insights)
│
└── AssistantInput
    ├── AI Avatar
    ├── Text Input
    ├── Attach Button
    └── Send Button
```

## 🎨 Component Details

### 1. MetricCard
**Location:** `src/components/overview/MetricCard.tsx`

**Purpose:** Display key financial metrics with optional action

**Features:**
- Clean card design with hover effects
- Large, prominent value display
- Optional "Tell Me More" action with arrow icon
- Fully typed props

**Reuse in other projects:** ✅ Financial dashboards, analytics pages, KPI displays

---

### 2. DateRangeSelector
**Location:** `src/components/overview/DateRangeSelector.tsx`

**Purpose:** Date selection with time period toggles

**Features:**
- Dropdown for date selection
- Toggle buttons for Month/Quarter/Year views
- Active state styling
- Callback support for both date and view changes

**Reuse in other projects:** ✅ Any dashboard or report with time-based data

---

### 3. PerformanceChart
**Location:** `src/components/overview/PerformanceChart.tsx`

**Purpose:** Multi-line chart for performance visualization

**Features:**
- Built with Recharts library
- Supports multiple data series (revenue, costs, cash)
- Interactive tooltips
- Responsive design
- Customizable colors via chartConfig

**Reuse in other projects:** ✅ Any financial or analytics dashboard

---

### 4. SpendingList & SpendingListItem
**Location:** `src/components/overview/SpendingList.tsx` & `SpendingListItem.tsx`

**Purpose:** Display spending categories with progress bars

**Features:**
- Card container with header
- Toggle buttons for percentage/dollar view
- Color-coded category indicators
- Animated progress bars
- Responsive percentage display

**Reuse in other projects:** ✅ Budget tracking, expense reports, category breakdowns

---

### 5. ActionButton
**Location:** `src/components/overview/ActionButton.tsx`

**Purpose:** Consistent action buttons with icons

**Features:**
- Two variants: default (primary) and outline
- Icon + text layout
- Hover states and transitions
- Works with Lucide React icons

**Reuse in other projects:** ✅ Any interface needing styled action buttons

---

### 6. AssistantInput
**Location:** `src/components/overview/AssistantInput.tsx`

**Purpose:** Chat-style input for AI assistant

**Features:**
- Rounded pill design
- AI avatar indicator
- Attach file button
- Send button with disabled state
- Enter key support
- Auto-clearing after send

**Reuse in other projects:** ✅ AI assistants, chat interfaces, search bars

## 🚀 Usage Example

```tsx
import {
  MetricCard,
  DateRangeSelector,
  PerformanceChart,
  SpendingList,
  ActionButton,
  AssistantInput,
} from '@/components/overview'
import { FileText } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="p-8 space-y-6 bg-[#FAFAFA]">
      {/* Date Selector */}
      <DateRangeSelector
        selectedDate="August 2025"
        defaultView="Month"
        onViewChange={(view) => console.log(view)}
      />

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-6">
        <MetricCard label="Revenue" value="$26,231" />
        <MetricCard label="Costs" value="$15,000" />
        <MetricCard label="Profit" value="$11,231" />
      </div>

      {/* Chart + Spending */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <PerformanceChart data={chartData} />
        </div>
        <SpendingList items={spendingData} />
      </div>

      {/* Actions */}
      <ActionButton
        icon={FileText}
        label="Generate Report"
        onClick={() => {}}
      />

      {/* Assistant */}
      <AssistantInput
        onSend={(msg) => console.log(msg)}
      />
    </div>
  )
}
```

## 🎯 Key Design Decisions

### 1. Component Isolation
Each component is self-contained with its own props interface, making it easy to:
- Test independently
- Reuse in different contexts
- Modify without affecting others
- Document clearly

### 2. Consistent Styling
All components use:
- Tailwind CSS for utility classes
- CSS variables for theming
- Poppins font family
- Consistent color palette (#2D7A4B primary green)

### 3. TypeScript First
Every component has:
- Typed props interfaces
- Type-safe callbacks
- Proper exports
- No `any` types

### 4. Responsive Design
Components adapt to screen sizes:
- Mobile: Single column stacking
- Tablet: 2-column layouts
- Desktop: Full 3-column grid

### 5. Accessibility
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus states on interactive elements

## 🔧 Technical Stack

- **React 18.3** - UI framework
- **TypeScript 5.6** - Type safety
- **Tailwind CSS 3.4** - Styling
- **Recharts** - Charts
- **Lucide React** - Icons
- **shadcn/ui** - Base components
- **Vite 5.4** - Build tool

## 📝 Next Steps

To further enhance these components:

1. **Add Storybook** - Document component variations
2. **Add Tests** - Unit tests for each component
3. **Theme Support** - Dark mode variants
4. **Animations** - Motion.dev integration
5. **Data Fetching** - React Query integration
6. **State Management** - Zustand or Context API

## ✅ Completed Tasks

- [x] Set up component folder structure
- [x] Create MetricCard component
- [x] Create DateRangeSelector component
- [x] Create PerformanceChart component
- [x] Create SpendingList components
- [x] Create ActionButton component
- [x] Create AssistantInput component
- [x] Assemble Overview page
- [x] Create comprehensive documentation
- [x] Test dev server

## 🌐 Development Server

The Overview page is now live at: **http://localhost:5174/**

Navigate to the Overview section in the sidebar to see all components in action.

---

**Created:** November 28, 2025
**Components:** 7 reusable components
**Documentation:** Complete with examples and best practices
