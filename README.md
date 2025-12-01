# BIPS Frontend Prototype

A collection of frontend experiments and prototypes built with React, TypeScript, Tailwind CSS, and Motion.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Motion** (motion.dev) - Animation library

## Getting Started

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── experiments/     # Individual experiment components
├── components/      # Shared/reusable components
├── utils/          # Utility functions and helpers
├── App.tsx         # Main app component
├── main.tsx        # Application entry point
└── index.css       # Global styles and Tailwind imports
```

## Creating New Experiments

Each experiment should be a self-contained component in `src/experiments/`. Import and render it in `App.tsx` to view it.

Example:
```tsx
// src/experiments/MyExperiment.tsx
import { motion } from 'motion/react'

export default function MyExperiment() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">My Experiment</h2>
      {/* Your experiment code */}
    </div>
  )
}
```
