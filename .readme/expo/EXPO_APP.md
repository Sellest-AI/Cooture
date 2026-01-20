# app/ Directory

Next.js App Router pages and layouts. See [Next.js App Router documentation](https://nextjs.org/docs/app) for core concepts.

## Protected Routes

Any route under `/app/*` requires authentication. The [middleware](../../src/middleware.ts) redirects unauthenticated users to `/auth` with a redirect parameter.

## Server vs Client Components

### Prioritize Server Components

Use server components (default) for data that doesn't need constant refresh. Since Convex is real-time, only use client components for data that should update live. Most of the time you want real-time. You rarely want server components (without preloadQuery). This is only for heavy data and is very rare.

**Server-side data fetching:**
```typescript
import { api, fetchQueryServer } from "@/lib/convex/server"

export default async function Page() {
  const data = await fetchQueryServer(api.router.examples.query.server, { name: 'User' })
  return <div>{data}</div>
}
```

**Client-side real-time data:**
```typescript
"use client"
import { api, useQuery } from '@/lib/convex/client'

export const Component = () => {
  const { data } = useQuery(api.router.examples.query.anon, { name: 'User' })
  return <div>{data}</div>
}
```

### PreloadQuery Pattern

Preload data server-side and hydrate on client while maintaining real-time updates:

```typescript
import { api, preloadQuery } from "@/lib/convex/server"
import { ClientComponent } from "./_components/client"

export default async function Page() {
  const preloaded = await preloadQuery(api.router.examples.query.anon, { id: '123' })
  return <ClientComponent preloadedData={preloaded} />
}
```

## Structure Conventions

### Folder Organization

Each page follows a modular structure with underscore-prefixed folders for page-specific code:

```
app/
├── example/
│   ├── page.tsx              # Page component (required)
│   ├── layout.tsx            # Optional layout for this route segment
│   ├── middleware.ts         # Optional route-specific middleware
│   ├── _components/          # Page-specific components
│   │   └── client-component.tsx
│   ├── _hooks/               # Page-specific hooks
│   │   └── use-example.ts
│   ├── _utils/               # Page-specific utilities
│   │   └── helpers.ts
│   └── modules/              # For complex pages with multiple modules
│       └── dashboard/
│           ├── dashboard.tsx           # Module component
│           ├── _components/            # Module-specific components
│           ├── _hooks/                 # Module-specific hooks
│           └── _utils/                 # Module-specific utilities
```

**Naming convention:**
- Underscore prefix (`_components/`, `_hooks/`, `_utils/`) prevents Next.js from treating them as routes
- `modules/` folder (lowercase, no underscore) for complex pages requiring multiple independent modules
- Each module follows the same structure: component at root, then `_components/`, `_hooks/`, `_utils/`
- Keep shared code in [src/hooks/](../../src/hooks/), [src/ui/](../../src/ui/), or [utils/](../../utils/)

**Sub-component naming pattern:**
When a component becomes too large and needs to be split into sub-components that are only used by the parent, use dot notation:

```
_components/
├── timeline.tsx           # Main component
├── timeline.bar.tsx       # Sub-component for timeline
└── timeline.resizer.tsx   # Sub-component for timeline
```

This pattern:
- Keeps related components visually grouped in the file system
- Makes it clear these are sub-components of the parent
- Can be imported individually if needed, but primarily used by the parent component

**When to use modules:**
Use the `modules/` folder when a screen is complex enough to require multiple self-contained sections, each with their own components, hooks, and utilities.

### Screen Components

React Native screens are client-side components:

```typescript
import { View, Text } from 'react-native'
import { useTranslations } from 'translations'

export default function HomeScreen() {
  const t = useTranslations('Home')
  return (
    <View>
      <Text>{t('title')}</Text>
    </View>
  )
}
```

**Note**: React Native doesn't have metadata or server-side rendering. Use libraries like `expo-head` for web-specific meta tags if needed.

## Configuration

### layout.tsx

Root layout configuration:
- **Font**: Change the imported font (currently Inter)
- **Metadata**: Default site metadata and OpenGraph tags
- **Providers**: Wraps all pages with context providers
- **ConvexAuthServerProvider**: Enables server-side Convex auth

### globals.css

Tailwind CSS imports and global styles.

## Example

See [src/app/example/](../../src/app/example/) for a complete example showing:
- Server component with `fetchQueryServer`
- Client component with `useQuery` and debouncing
- Metadata with translations
- Component organization in `_components/`
