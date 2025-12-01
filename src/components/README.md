# Components

## AppSidebar

A fully-featured, collapsible navigation sidebar component built with shadcn/ui and the Bips design system.

### Features

- **Collapsible sidebar** - Expands and collapses to icons with keyboard shortcut (Cmd/Ctrl + B)
- **Navigation menu items** with icons (Overview, Transactions, Linked Accounts)
- **Hover and active states** - Visual feedback for menu items
- **Account dropdown flyout** - Full menu with Account, Settings, Support, and Log out options
- **Announcement card** - Dismissible notification card (hidden when collapsed)
- **Responsive design** - Mobile-friendly with off-canvas behavior
- **Persisted state** - Sidebar state saved across page reloads
- Fully styled with Bips design tokens (colors, spacing, typography)

### Usage

```tsx
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'

function App() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header>
          <SidebarTrigger />
          <h1>Page Title</h1>
        </header>
        <main>
          {/* Page content */}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

### Keyboard Shortcuts

- **Cmd/Ctrl + B** - Toggle sidebar expand/collapse

### Component Structure

The sidebar is built using shadcn/ui components:

- `SidebarProvider` - Manages collapsible state and provides context
- `SidebarHeader` - Contains logo and toggle button
- `SidebarContent` - Scrollable content area with navigation and announcement
- `SidebarFooter` - Account dropdown menu
- `SidebarTrigger` - Button to toggle sidebar (place in your header)
- `SidebarInset` - Main content wrapper that adjusts to sidebar state

### Menu Item States

- **Default**: Medium weight, neutral color
- **Hover**: Light background highlight
- **Active**: Light background, semibold weight

### Account Dropdown Menu

The footer includes a dropdown menu with:
- Account information display
- Account settings option
- Settings option  
- Support option
- Log out option

### Design Tokens Used

All styling uses CSS variables from the Bips design system:

- **Colors**: `--color-neutral-n-800`, `--color-neutral-n-600`, `--color-neutral-g-50`, `--color-neutral-g-100`, `--color-neutral-g-200`, `--color-white`
- **Spacing**: `--space-8`, `--space-12`, `--space-16`, `--space-20`
- **Radius**: `--radius-8`, `--radius-12`, `--radius-full`
- **Typography**: Poppins font family with various weights
- **Sidebar**: shadcn/ui sidebar theme variables customized for Bips

### Pages

Placeholder pages are available in `src/components/pages/`:

- `Overview.tsx` - Overview/dashboard page
- `Transactions.tsx` - Transactions list page
- `LinkedAccounts.tsx` - Linked accounts management page

### Demo

See `src/experiments/SidebarDemo.tsx` for a complete example with navigation.
