# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BIPS Frontend Prototype is a collection of frontend experiments and prototypes built with React, TypeScript, Tailwind CSS, and Motion (motion.dev). This repository serves as a playground for testing UI concepts, animations, and interaction patterns.

## Tech Stack

- **React 18.3** - UI library with hooks and modern patterns
- **TypeScript 5.6** - Static typing with strict mode enabled
- **Vite 5.4** - Fast development server and build tool
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library built with Radix UI and Tailwind CSS
- **Motion** (motion.dev) - Modern animation library for React
- **ESLint** - Code linting with React hooks and TypeScript support

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Project Architecture

```
src/
├── experiments/        # Individual experiment components
│   └── ExampleAnimation.tsx
├── components/         # Shared/reusable components
│   └── ui/            # shadcn/ui components (auto-generated)
├── lib/               # Library code and utilities
│   └── utils.ts       # Utility functions (includes cn helper)
├── utils/             # Custom utility functions and helpers
├── App.tsx            # Main app component - renders experiments
├── main.tsx           # Application entry point
├── index.css          # Global styles + Tailwind imports + CSS variables
└── vite-env.d.ts      # Vite type definitions
```

## Key Patterns and Conventions

### Creating Experiments

Each experiment should be a self-contained component in `src/experiments/`:

1. Create a new file in `src/experiments/` (e.g., `MyExperiment.tsx`)
2. Export a default function component
3. Import and render it in `App.tsx`

Example structure:
```tsx
import { motion } from 'motion/react'

export default function MyExperiment() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">My Experiment</h2>
      {/* Experiment content */}
    </div>
  )
}
```

### Motion (motion.dev) Usage

Motion is imported as `motion/react`. Key exports:
- `motion` - Creates animated DOM elements (motion.div, motion.button, etc.)
- Common props: `animate`, `initial`, `transition`, `whileHover`, `whileTap`
- Supports keyframe animations with arrays

Example:
```tsx
<motion.div
  animate={{ scale: [1, 1.2, 1] }}
  transition={{ duration: 2, repeat: Infinity }}
/>
```

### Tailwind CSS

- Uses Tailwind CSS v3.4 with traditional syntax
- CSS import in `src/index.css` uses standard directives: `@tailwind base/components/utilities`
- PostCSS plugin: `tailwindcss` (standard v3 setup)
- Configured to scan `index.html` and all `.jsx/.tsx` files in `src/`
- Prefer Tailwind utilities over custom CSS
- CSS variables defined in `src/index.css` for theming (light/dark mode support)

### shadcn/ui

- Component library using Radix UI primitives styled with Tailwind CSS
- Style: "new-york" variant
- Components are copied into `src/components/ui/` (NOT installed as dependencies)
- Icon library: Lucide React

**Adding components:**
```bash
npx shadcn@latest add button
npx shadcn@latest add card
# etc...
```

**Using components:**
```tsx
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function MyComponent() {
  return (
    <Button className={cn('custom-class')}>
      Click me
    </Button>
  )
}
```

**Utility function:**
- `cn()` from `@/lib/utils` - Combines clsx and tailwind-merge for className handling

### TypeScript Configuration

- Strict mode enabled with additional checks (noUnusedLocals, noUnusedParameters)
- JSX transform set to `react-jsx` (no React import needed)
- Module resolution: `bundler` mode for Vite compatibility
- Separate configs: `tsconfig.app.json` (source) and `tsconfig.node.json` (build tools)
- Path aliases configured:
  - `@/*` maps to `./src/*`
  - Use imports like `@/components/ui/button` instead of relative paths

## File Organization

- Place experiment-specific components in `src/experiments/`
- Place custom reusable components in `src/components/`
- shadcn/ui components are auto-generated in `src/components/ui/`
- Place library code in `src/lib/`
- Place custom helper functions in `src/utils/`
- Keep experiments isolated - they should work independently
- Update `App.tsx` to showcase new experiments
- Use path aliases (e.g., `@/components/ui/button`) instead of relative imports

## Build Output

- Production builds go to `dist/`
- TypeScript is compiled before Vite builds
- Command: `npm run build` (runs `tsc -b && vite build`)
