# Overview Page Components

This directory contains reusable components designed for financial dashboard interfaces. All components are built with React, TypeScript, Tailwind CSS, and are fully self-contained for easy reuse in other projects.

## Component Structure

```
src/components/overview/
├── MetricCard.tsx           # Display metric with value and action
├── DateRangeSelector.tsx    # Date selector with view toggles
├── PerformanceChart.tsx     # Multi-line chart with Recharts
├── SpendingList.tsx         # List container for spending items
├── SpendingListItem.tsx     # Individual spending category row
├── ActionButton.tsx         # Styled action button with icon
├── AssistantInput.tsx       # Chat-style input component
└── index.ts                 # Barrel export for easy imports
```

## Components

### MetricCard

Displays a financial metric with optional "Tell Me More" action.

**Props:**
- `label: string` - Metric label (e.g., "Revenue")
- `value: string` - Formatted value (e.g., "$26,231")
- `onTellMeMore?: () => void` - Optional callback for the action

**Usage:**
```tsx
import { MetricCard } from '@/components/overview'

<MetricCard
  label="Revenue"
  value="$26,231"
  onTellMeMore={() => console.log('More info')}
/>
```

---

### DateRangeSelector

Date selector with Month/Quarter/Year view toggles.

**Props:**
- `selectedDate?: string` - Currently selected date (default: "August 2025")
- `onDateChange?: (date: string) => void` - Date change callback
- `defaultView?: 'Month' | 'Quarter' | 'Year'` - Initial view (default: "Month")
- `onViewChange?: (view: ViewType) => void` - View change callback

**Usage:**
```tsx
import { DateRangeSelector } from '@/components/overview'

<DateRangeSelector
  selectedDate="August 2025"
  onDateChange={(date) => console.log(date)}
  onViewChange={(view) => console.log(view)}
/>
```

---

### PerformanceChart

Multi-line chart visualization using Recharts.

**Props:**
- `data: DataPoint[]` - Array of data points with date, revenue, costs, cash
- `title?: string` - Chart title (default: "Performance Summary")

**Data Structure:**
```typescript
interface DataPoint {
  date: string
  revenue: number
  costs: number
  cash: number
}
```

**Usage:**
```tsx
import { PerformanceChart } from '@/components/overview'

const data = [
  { date: '8/1', revenue: 6500, costs: 4800, cash: 5500 },
  { date: '8/6', revenue: 8200, costs: 5200, cash: 6200 },
  // ... more data points
]

<PerformanceChart data={data} title="Monthly Performance" />
```

---

### SpendingList & SpendingListItem

Display spending categories with progress bars.

**SpendingList Props:**
- `items: SpendingItem[]` - Array of spending items
- `showPercentage?: boolean` - Show percentage toggle (default: true)
- `title?: string` - List title (default: "Top Spending")

**SpendingItem Structure:**
```typescript
interface SpendingItem {
  category: string
  percentage: number
  color?: string
}
```

**Usage:**
```tsx
import { SpendingList } from '@/components/overview'

const spendingData = [
  { category: 'Equipment', percentage: 28, color: '#2D7A4B' },
  { category: 'Payroll', percentage: 28, color: '#3182CE' },
  // ... more items
]

<SpendingList items={spendingData} title="Top Spending" />
```

---

### ActionButton

Styled button with icon for actions.

**Props:**
- `icon: LucideIcon` - Lucide React icon component
- `label: string` - Button text
- `onClick?: () => void` - Click handler
- `variant?: 'default' | 'outline'` - Style variant (default: 'outline')

**Usage:**
```tsx
import { ActionButton } from '@/components/overview'
import { FileText } from 'lucide-react'

<ActionButton
  icon={FileText}
  label="Generate Report"
  onClick={() => console.log('Generate')}
  variant="default"
/>
```

---

### AssistantInput

Chat-style input field with send and attach actions.

**Props:**
- `placeholder?: string` - Input placeholder text
- `onSend?: (message: string) => void` - Send message callback
- `onAttach?: () => void` - Attach file callback

**Usage:**
```tsx
import { AssistantInput } from '@/components/overview'

<AssistantInput
  placeholder="Ask me anything..."
  onSend={(msg) => console.log('Sent:', msg)}
  onAttach={() => console.log('Attach file')}
/>
```

## Reusing in Other Projects

### Step 1: Copy the Components

Copy the entire `overview/` directory to your project:

```bash
cp -r src/components/overview /path/to/your-project/src/components/
```

### Step 2: Install Dependencies

Ensure these dependencies are installed:

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "lucide-react": "latest",
    "recharts": "^2.12.0"
  }
}
```

### Step 3: Copy shadcn/ui Components

These components depend on shadcn/ui. Copy the required UI components:

```bash
# Required shadcn/ui components
npx shadcn@latest add card
```

### Step 4: Configure Tailwind

Ensure your `tailwind.config.js` includes the component paths:

```js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  // ... rest of config
}
```

### Step 5: Use Path Aliases

Configure TypeScript path aliases in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

And in `vite.config.ts` (if using Vite):

```ts
import path from 'path'

export default {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}
```

## Styling

All components use:
- **Tailwind CSS** for utility styling
- **CSS Variables** for theming (defined in `index.css`)
- **Poppins font** for typography (specified via `font-['Poppins']`)

Key color variables:
- `--color-neutral-n-800` - Dark text
- `--color-neutral-n-600` - Medium text
- `--color-neutral-n-400` - Light text
- `#2D7A4B` - Primary green

## Customization

### Changing Colors

Update the color props in individual components:

```tsx
<SpendingListItem
  category="Equipment"
  percentage={28}
  color="#YOUR_COLOR"
/>
```

### Modifying Chart Configuration

Edit the `chartConfig` in `PerformanceChart.tsx`:

```tsx
const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: '#YOUR_COLOR',
  },
  // ... other lines
}
```

### Adjusting Layout

The Overview page uses CSS Grid. Modify the grid classes:

```tsx
// Change from 3 columns to 4 columns
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
```

## Best Practices

1. **Keep components pure** - Components only manage their own state
2. **Pass callbacks** - Let parent components handle business logic
3. **Use TypeScript** - All components are fully typed
4. **Responsive design** - Components adapt to mobile/tablet/desktop
5. **Accessibility** - Proper ARIA labels and semantic HTML

## Example: Full Page Implementation

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
  const chartData = [/* your data */]
  const spendingData = [/* your data */]

  return (
    <div className="p-8 space-y-6">
      <DateRangeSelector />

      <div className="grid grid-cols-3 gap-6">
        <MetricCard label="Revenue" value="$26,231" />
        <MetricCard label="Costs" value="$15,000" />
        <MetricCard label="Profit" value="$11,231" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <PerformanceChart data={chartData} />
        </div>
        <SpendingList items={spendingData} />
      </div>

      <ActionButton
        icon={FileText}
        label="Generate Report"
        onClick={() => {}}
      />

      <AssistantInput onSend={(msg) => console.log(msg)} />
    </div>
  )
}
```

## License

These components are part of the BIPS Frontend Prototype and can be freely reused in your projects.
