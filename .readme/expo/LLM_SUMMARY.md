# Next.js Application Documentation - LLM Summary

## Quick Overview

This is the **Next.js 16+ frontend** for a full-stack application with Convex backend. Uses App Router, server components by default, and real-time data with Convex.

**⚠️ CRITICAL**: Files use **kebab-case**, code inside uses **CamelCase**, private functions prefixed with **underscore** (`_functionName`).

---

## Documentation Structure

This folder contains comprehensive documentation for the Expo/React Native application. Each file focuses on a specific aspect:

| File                   | Purpose                                                 | Read When                      |
| ---------------------- | ------------------------------------------------------- | ------------------------------ |
| **ROOT.md**            | Main overview, structure, naming conventions            | Starting point - read first    |
| **EXPO_APP.md**        | Expo Router patterns, screen structure                  | Creating screens or navigation |
| **EXPO_HOOKS.md**      | Application hooks (can interact with Convex)            | Creating shared hooks          |
| **EXPO_PROVIDERS.md**  | React Context providers (Convex, i18n, analytics)       | Understanding app context      |
| **EXPO_UI.md**         | Isolated UI system (reusable components, hooks, utils)  | Working with UI components     |
| **lib/LIB_CONVEX.md**  | Convex client integration (useQuery, useMutation, etc.) | Fetching data from Convex      |
| **lib/LIB_POSTHOG.md** | PostHog analytics integration (React Native)            | Adding event tracking          |
| **lib/LIB_IMAGE.md**   | Image processing utilities                              | Working with images            |

---

## Critical Rules (READ FIRST)

### 1. Naming Convention
```typescript
// Files: kebab-case
user-profile.tsx
use-debounce.ts
get-user-data.ts

// Inside files: CamelCase
export function UserProfile() {}
export const useDebounce = () => {}

// Private/internal: underscore prefix
function _parseData() {}
const _internalHelper = () => {}
```

### 2. Server vs Client Components
```typescript
// ✅ Server Component (default) - for non-realtime data
import { api, fetchQueryServer } from "@/lib/convex/server"

export default async function Page() {
  const data = await fetchQueryServer(api.router.users.getOne.server)
  return <div>{data.name}</div>
}

// ✅ Client Component - for realtime data
"use client"
import { api, useQuery } from '@/lib/convex/client'

export function Component() {
  const { data } = useQuery(api.router.users.getOne.authed)
  return <div>{data?.name}</div>
}
```

### 3. UI Isolation
```typescript
// ✅ CORRECT - UI folder is isolated
// src/ui/components/button.tsx
import { cn } from '@ui/utils'
export function Button() { /* pure UI */ }

// ❌ WRONG - NO Convex in UI folder
import { useQuery } from 'convex/react' // DON'T DO THIS IN ui/
```

### 4. Server Actions Pattern
```typescript
// src/actions/users/get-name.ts
"use server"
import { Id } from "@/lib/convex/server"

export const getName = async (userId: Id<'users'>) => {
  // Fetch and sanitize private data
  return { name: user.name }
}

// Usage
import { getName } from '@/actions/users/get-name'
const name = await getName(userId)
```

### 5. Import Aliases
```typescript
// ✅ CORRECT
import { Button } from '@ui/button'
import { useClient } from '@ui/hooks/use-client'
import { cn } from '@ui/utils'
import { useDebounce } from '@/hooks'
import { api } from '@/lib/convex/client'
import from 'global'

// ❌ WRONG
import { Button } from '../../ui/components/button'
import { env } from '../../../env'
```

---

## Folder Structure

```
src/
├── middleware.ts          # Auth protection for /app/* routes
├── global/               # Global constants (import from "global")
├── app/                  # Next.js App Router
│   ├── layout.tsx       # Root layout (font, metadata, providers)
│   ├── page.tsx         # Homepage
│   └── [route]/         # Page folders
│       ├── page.tsx            # Page component
│       ├── layout.tsx          # Optional layout
│       ├── middleware.ts       # Optional route middleware
│       ├── _components/        # Page-specific components
│       ├── _hooks/            # Page-specific hooks
│       ├── _utils/            # Page-specific utilities
│       └── modules/           # Complex page modules
├── actions/              # Server actions ("use server")
│   └── users/
│       └── get-name.ts  # One function per file
├── api/                  # API routes
│   └── example/
│       └── route.ts     # Standardized handler
├── hooks/                # Shared hooks (CAN interact with Convex)
│   ├── use-debounce.ts
│   └── use-resolve-on-change.ts
├── providers/            # Context providers
│   ├── index.tsx        # Main providers wrapper
│   └── async/           # Async providers (tracking, side effects)
├── lib/                  # Library integrations
│   ├── convex/          # Convex client/server helpers
│   ├── posthog/         # Analytics
│   └── image/           # Image processing
└── ui/                   # Isolated UI system (NO Convex!)
    ├── components/      # shadcn/ui components
    ├── hooks/          # UI-specific hooks
    └── utils/          # UI utilities
```

---

## Common Patterns

### Creating a New Page
1. Create folder: `app/dashboard/`
2. Add `page.tsx` with metadata export
3. Use server component by default
4. Add `_components/` for page-specific components
5. Use `modules/` if page is complex

📖 **Read**: EXPO_APP.md for complete patterns

### Sub-Component Naming
```
_components/
├── timeline.tsx           # Main component
├── timeline.bar.tsx       # Sub-component
└── timeline.resizer.tsx   # Sub-component
```

### Fetching Data
```typescript
// Client (realtime)
const { data } = useQuery(api.router.users.getOne.authed)

// Server (static at build/request time)
const data = await fetchQueryServer(api.router.users.getOne.server)

// PreloadQuery (server → client hydration)
const preloaded = await preloadQuery(api.router.data.get)
return <ClientComponent preloadedData={preloaded} />
```

📖 **Read**: lib/LIB_CONVEX.md for all patterns

### Adding Analytics
```typescript
// Server-side event tracking
import { posthogSSR } from '@/lib/posthog'

posthogSSR(user._id)?.captureAndClose(({ events }) => ({
  event: events.TASK.EDIT.IMAGE.STARTED,
  properties: { taskId: run.id },
}))
```

📖 **Read**: lib/LIB_POSTHOG.md

---

## Import Aliases

| Alias           | Points To               | Use Case                    |
| --------------- | ----------------------- | --------------------------- |
| `@ui/*`         | `expo/ui/components/*`  | UI components               |
| `@ui/hooks/*`   | `expo/ui/hooks/*`       | UI-specific hooks           |
| `@ui/utils`     | `expo/ui/utils`         | UI utilities                |
| `@/`            | `expo/`                 | Any expo folder import      |
| `@utils/*`      | `utils/*`               | Shared utilities            |
| `@shared/utils` | `utils/convex-allowed/` | Cross-environment utilities |
| `global`        | `expo/global`           | Global constants            |
| `translations`  | `translations/`         | i18n (react-i18next)        |
| `env`           | `env.js`                | Type-safe environment vars  |

---

## Quick Navigation

**Need to**:
- Create a screen? → `EXPO_APP.md`
- Use Convex data? → `lib/LIB_CONVEX.md`
- Add UI component? → `EXPO_UI.md`
- Create shared hook? → `EXPO_HOOKS.md`
- Understand providers? → `EXPO_PROVIDERS.md`
- Track analytics? → `lib/LIB_POSTHOG.md`
- Process images? → `lib/LIB_IMAGE.md`

**Start with**: `ROOT.md` for overview, then `EXPO_APP.md` for screen creation.

---

## Protected Routes

Routes under `/app/*` require authentication via middleware. Unauthenticated users are redirected to `/auth` with redirect parameter.

---

## Key Principles

1. **Server components by default** - Only use client components for real-time data
2. **UI isolation** - `src/ui/` folder must NOT import Convex or business logic
3. **One function per file** - Server actions export single explicit functions
4. **kebab-case files** - Component files, hook files, utility files
5. **Metadata everywhere** - Every page exports metadata (async with translations)
6. **Domain organization** - Group related code by business domain (users, subscriptions, etc.)

---

## Technology Stack

- **Frontend**: Next.js 16+ with React 19
- **Routing**: App Router (server components by default)
- **UI**: shadcn/ui with Tailwind CSS 4+
- **State**: Jotai
- **Animations**: Framer Motion
- **i18n**: react-i18next
- **Analytics**: PostHog
- **Real-time Data**: Convex
- **Package Manager**: PNPM

---

## Remember

1. **kebab-case** for files, **CamelCase** inside, **_prefix** for private
2. **Server components** by default, client only for real-time
3. **UI folder** is completely isolated from Convex and business logic
4. **Server actions** one explicit function per file with "use server"
5. **Use aliases** - @ui/*, @/*, global, translations
6. **Metadata** on every page (use translations for i18n)
7. Read specific documentation files for detailed patterns and examples
