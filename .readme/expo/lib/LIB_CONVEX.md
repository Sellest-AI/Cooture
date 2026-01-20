# Convex Integration Library Documentation

## Overview

The `expo/lib/convex/` folder contains wrapper files that provide a clean interface for accessing Convex from React Native. These files act as the **bridge between your frontend and the Convex backend**.

**⚠️ CRITICAL**: Always import from these files, NEVER from `convex/_generated/` directly.

---

## File Structure

```
expo/lib/convex/
├── client.ts       # Client-side hooks (React Native)
├── api.ts          # Type-safe API + types (shared)
├── auth.ts         # Authentication helpers
├── agent.ts        # AI agent utilities
└── utils.ts        # Shared utilities
```

**Note**: `server.ts` exists for legacy compatibility but is not used in React Native (no server-side rendering).

---

## `client.ts` - Client-Side Hooks

**Use in**: Client Components (`"use client"`)

### Available Exports

#### Core Hooks

```typescript
import { api, useQuery, useMutation, useAction } from '@/lib/convex/client';

// Query with reactive updates
const { data, isPending } = useQuery(api.router.users.getOne.authed);

// Mutation with loading states
const { mutate, isLoading, isSuccess, isError } = useMutation(
  api.router.users.updateOne.authed
);

await mutate({ name: 'John' });

// Action with loading states
const { action, isLoading, isSuccess, isError } = useAction(
  api.router.stripe.createCheckout.authed
);

await action({ priceId: 'price_xxx' });
```

**Key Features**:
- `useMutation` and `useAction` return enhanced hooks with `isLoading`, `isSuccess`, `isError` states
- Automatic error handling and loading state management
- Type-safe with full autocomplete

#### Cached Queries

```typescript
import { useQueryCached, usePaginatedQueryCached } from '@/lib/convex/client';

// Cached query (persists across component unmounts)
const { data, status } = useQueryCached(api.router.posts.getMany.anon);

// Paginated cached query
const { results, loadMore } = usePaginatedQueryCached(
  api.router.posts.getMany.anon,
  { limit: 10 }
);
```

#### Preloaded Queries

```typescript
import { usePreloadedQuery } from '@/lib/convex/client';
import type { Preloaded } from '@/lib/convex/client';

// Server preloads the query
const preloaded = await preloadQuery(api.router.users.getOne.authed);

// Client uses preloaded data
function Component({ preloaded }: { preloaded: Preloaded<typeof api.router.users.getOne.authed> }) {
  const data = usePreloadedQuery(preloaded);
}
```

#### Other Utilities

```typescript
import { useConvex, usePaginatedQuery } from '@/lib/convex/client';

// Direct Convex client access
const convex = useConvex();

// Standard paginated query
const { results, loadMore, status } = usePaginatedQuery(
  api.router.posts.getMany.anon,
  { limit: 10 }
);
```

### Complete Export List

| Export                    | Type   | Purpose                                   |
| ------------------------- | ------ | ----------------------------------------- |
| `api`                     | Object | Type-safe API object                      |
| `Id`, `Doc`               | Types  | Convex ID and document types              |
| `useQuery`                | Hook   | Reactive queries with automatic caching   |
| `useQueryCached`          | Hook   | Cached queries (persists across unmounts) |
| `useMutation`             | Hook   | Mutations with loading states             |
| `useAction`               | Hook   | Actions with loading states               |
| `usePaginatedQuery`       | Hook   | Standard paginated queries                |
| `usePaginatedQueryCached` | Hook   | Cached paginated queries                  |
| `usePreloadedQuery`       | Hook   | Use preloaded query data                  |
| `useConvex`               | Hook   | Direct Convex client access               |
| `Preloaded`               | Type   | Type for preloaded queries                |

---

## `server.ts` - ⚠️ Not Used in React Native

**Note**: This file exists for legacy compatibility but is NOT used in Expo/React Native applications. React Native does not have server-side rendering or server components.

All data fetching in React Native should use the client-side hooks from `client.ts`:
- `useQuery`, `useMutation`, `useAction` for reactive data
- `useConvex()` for direct Convex client access

See the `client.ts` section above for all available hooks and utilities.

---

## `api.ts` - Type-Safe API

**Use in**: Anywhere (types only) or import via `client.ts`

### Exports

```typescript
import type { Api, Id, Doc } from '@/lib/convex/api';
import { api } from '@/lib/convex/api';

// Type for entire API
type MyApi = Api;

// Type for specific table ID
type UserId = Id<'users'>;
type ImageId = Id<'images'>;

// Type for table documents
type User = Doc<'users'>;
type Image = Doc<'images'>;

// API object (also exported from client.ts)
const myRoute = api.router.users.getOne;
```

**Note**: Usually imported via `client.ts`, not directly.

---

## `auth.ts` - Authentication Helpers

**Use in**: Client Components

### Available Exports

```typescript
import { useAuthActions, useUser, useIsAuthenticated } from '@/lib/convex/auth';

// Sign in with Google
const { signInGoogle, signInEmail, signOut } = useAuthActions();

await signInGoogle('/dashboard'); // Optional redirect route

// Sign in with email
const formData = new FormData();
formData.set('email', 'user@example.com');
await signInEmail(formData);

// Sign out
await signOut();

// Get current user
const user = useUser();

// Check if authenticated
const isAuthenticated = useIsAuthenticated();
```

### Integration with Convex

```typescript
import { api, useQuery } from '@/lib/convex/client';
import { useUser } from '@/lib/convex/auth';

function Profile() {
  const user = useUser();
  
  // User is automatically available in authed procedures
  const { data } = useQuery(api.router.users.getProfile.authed);
  
  return <div>{user?.name}</div>;
}
```

---

## `agent.ts` - AI Agent Utilities

**Use in**: Client Components with AI features

### Available Exports

```typescript
import { 
  useSmoothText, 
  useUIMessages, 
  useThreadMessages,
  toUIMessages 
} from '@/lib/convex/agent';

import type { Thread, UIMessage, ThreadId } from '@/lib/convex/agent';

// Smooth text streaming
const { text, isStreaming } = useSmoothText(streamedText);

// UI messages from thread
const messages = useUIMessages(threadId);

// Thread messages
const threadMessages = useThreadMessages(threadId);

// Convert to UI messages
const uiMessages = toUIMessages(rawMessages);
```

---

## `utils.ts` - Shared Utilities

```typescript
import { retryMutation } from '@/lib/convex/utils';

// Retry a mutation with exponential backoff
await retryMutation(async () => {
  await mutate({ ... });
});
```

---

## Usage Patterns

### Client Component Pattern

```typescript
"use client"
import { api, useQuery, useMutation } from '@/lib/convex/client';
import { useUser } from '@/lib/convex/auth';

export function MyComponent() {
  const user = useUser();
  const { data, isPending } = useQuery(api.router.posts.getMany.anon);
  const { mutate, isLoading } = useMutation(api.router.posts.createOne.authed);
  
  const handleCreate = async () => {
    await mutate({ title: 'New Post' });
  };
  
  return <div>...</div>;
}
```

### Server Component Pattern

```typescript
import { api, fetchQueryServer, preloadQuery } from '@/lib/convex/server';

export default async function ServerPage() {
  // Fetch data server-side
  const data = await fetchQueryServer(api.router.admin.getStats.server);
  
  // Preload for client
  const preloaded = await preloadQuery(api.router.posts.getMany.anon);
  
  return <ClientComponent preloaded={preloaded} />;
}
```

### Server Action Pattern

```typescript
"use server"
import { api, fetchMutationServer, getUserIdentity } from '@/lib/convex/server';

export async function updateProfile(formData: FormData) {
  // Get current user (throws if not authenticated)
  const user = await getUserIdentity();
  
  // Update profile with server mutation
  const result = await fetchMutationServer(
    api.router.users.updateProfile.server,
    {
      userId: user._id,
      name: formData.get('name') as string
    }
  );
  
  return result;
}
```

---

## Import Decision Tree

```
Where are you?
├─ Client Component ("use client")
│   ├─ Need queries/mutations/actions?
│   │   └─ import from '@/lib/convex/client'
│   ├─ Need auth actions?
│   │   └─ import from '@/lib/convex/auth'
│   └─ Need AI features?
│       └─ import from '@/lib/convex/agent'
│
├─ Server Component / Server Action
│   ├─ Need to fetch data?
│   │   └─ import from '@/lib/convex/server'
│   └─ Need types only?
│       └─ import type from '@/lib/convex/api'
│
└─ Types only (any file)
    └─ import type from '@/lib/convex/api'
```

---

## Common Mistakes

### ❌ WRONG

```typescript
// DON'T import from generated files
import { api } from '../../../convex/_generated/api';
import { useQuery } from 'convex/react';

// DON'T pass _serverKey manually
await fetchQueryServer(api.router.users.getOne.server, {
  userId: 'xxx',
  _serverKey: env.CONVEX_SERVER_TOKEN // WRONG!
});

// DON'T use wrong import for environment
import { useQuery } from '@/lib/convex/server'; // server doesn't export useQuery!
```

### ✅ CORRECT

```typescript
// DO import from wrapper files
import { api, useQuery } from '@/lib/convex/client';

// DO let fetchQueryServer handle _serverKey
await fetchQueryServer(api.router.users.getOne.server, {
  userId: 'xxx'
  // _serverKey automatically added!
});

// DO use correct import for environment
import { useQuery } from '@/lib/convex/client'; // client for hooks
import { fetchQuery } from '@/lib/convex/server'; // server for fetch
```

---

## Summary

The `src/lib/convex/` folder provides:

- ✅ **Clean separation** between client and server Convex access
- ✅ **Enhanced hooks** with loading states for mutations/actions
- ✅ **Automatic `_serverKey` injection** for server procedures
- ✅ **Type safety** with full autocomplete support
- ✅ **Authentication helpers** for sign in/out and user state
- ✅ **AI agent utilities** for LLM features
- ✅ **Never import from generated files** - always use these wrappers

**Remember**:
1. Client components → `@/lib/convex/client`
2. Server components/actions → `@/lib/convex/server`
3. Auth helpers → `@/lib/convex/auth`
4. AI features → `@/lib/convex/agent`
5. Types only → `@/lib/convex/api`
6. `*Server` functions auto-include `_serverKey` - don't pass it!
