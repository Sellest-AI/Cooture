# UI System

UI components, hooks, and utilities following shadcn/ui patterns. Configured via [components.json](../../components.json) at the project root.

**Important**: This folder is isolated and should NOT interact with Convex or application-specific logic. Keep it pure and reusable.

## Structure

### Components ([src/ui/components/](../../src/ui/components/))

Entry point for shadcn components with custom enhancements, imported via `@ui/*`:

```typescript
import { Button } from '@ui/button'
import { Image } from '@ui/image'
import { Link } from '@ui/link'
import { motion } from '@ui/motion'
import { Skeleton } from '@ui/skeleton'
import { Icons } from '@ui/icons'
```

- **button.tsx**: Enhanced button with loading states, icons, variants (default, secondary, destructive, outline, ghost), and sizes
- **image.tsx**: Next.js Image wrapper with automatic unoptimization for specific domains (Backblaze, localhost, etc.)
- **link.tsx**: Navigation link component
- **motion.tsx**: Re-export of framer-motion for animations
- **skeleton.tsx**: Loading skeleton component
- **icons/**: Icon components collection

### Hooks ([src/ui/hooks/](../../src/ui/hooks/))

UI-specific React hooks imported via `@ui/hooks/*`:

```typescript
import { useClient } from '@ui/hooks/use-client'
import { useBreakpoint } from '@ui/hooks/use-breakpoint'
import { useIsMobile } from '@ui/hooks/use-mobile'
import { useHorizontalScroll } from '@ui/hooks/use-horizontal-scroll'
import { useTheme } from '@ui/hooks/use-theme'

// Check if code is running on client-side
const isClient = useClient()

// Responsive breakpoint detection
const { isAboveMd, isBelowMd, md } = useBreakpoint('md')
const { isAboveSm } = useBreakpoint('sm')

// Mobile detection (< 768px)
const isMobile = useIsMobile()

// Horizontal scrolling with wheel
const scrollRef = useHorizontalScroll<HTMLDivElement>()

// Theme management (persisted in localStorage)
const [theme, setTheme] = useTheme() // 'light' | 'dark'
```

### Utils ([src/ui/utils/](../../src/ui/utils/))

UI-related utility functions:

```typescript
// Class name merging (Tailwind + clsx)
import { cn } from '@ui/utils'
const className = cn('base-class', condition && 'conditional-class')

// Color manipulation
import { hslToHex, getDarkerHsl, getLighterHsl, hslWithAlpha } from '@ui/utils'
const hex = hslToHex(210, 50, 50)
const darker = getDarkerHsl([210, 50, 50], 10)
const withAlpha = hslWithAlpha('hsl(210, 50%, 50%)', 0.5)

// Cookie management (client-side)
import { getCookie, setCookie } from '@ui/utils'
setCookie('name', 'value', 7) // 7 days
const value = getCookie('name')

// Interactive element detection
import { isInteractiveElement } from '@ui/utils'
const isInteractive = isInteractiveElement(document.activeElement)
```

## shadcn/ui Integration

The project uses shadcn/ui components with customizations. Install new components:

```bash
npx shadcn@latest add <component-name>
```

Components are added to [src/ui/components/](../../src/ui/components/) with path aliases configured in [components.json](../../components.json).

## Key Features

- **Type-safe variants**: Using `class-variance-authority` for component variants
- **Responsive design**: Built-in breakpoint hooks matching Tailwind config
- **Theme support**: Dark/light mode with Jotai persistence
- **Performance optimized**: Image component with selective optimization
- **Accessible**: Focus states, ARIA attributes, and keyboard navigation
