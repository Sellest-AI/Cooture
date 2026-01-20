# Convex Router Documentation

## Overview

The `router/` folder is **the most important folder** in the Convex architecture. It exports all routes/endpoints that can be called from external services (Next.js frontend, webhooks, server actions, etc.).

**Key Principle**: Router files export procedures that serve as the public API of your backend.

---

## Routing Convention

### Folder & File Structure

The router follows a **VERY SPECIFIC CONVENTION** that maps directly to how you call functions from the frontend:

```
/router/
  └── {namespace}/           # Business logic domain (users, storage, etc.)
      └── {subfolder}/       # Optional sub-categorization (images, videos)
          └── {operation}.ts # Operation name (getOne, getMany, createOne)
              └── {procedure} # Exported procedure (anon, authed, server, _internal)
```

### Structure Maps to API Calls

**File**: `router/storage/images/getOne.ts`

```typescript
import { publicQuery, internalQuery } from "../../../procedures";

export const anon = publicQuery({
  args: { id: v.id("images") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const _internal = internalQuery({
  args: { id: v.id("images") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

**Frontend Call**:
```typescript
import { api } from '@/lib/convex/client';
import { useQuery } from 'convex/react';

// Structure: api.router.{namespace}.{subfolder}.{operation}.{procedure}
const { data, isPending } = useQuery(
  api.router.storage.images.getOne.anon, 
  { id: 'xxxx' }
);
```

**Breaking Down the Path**:
```
api.router.storage.images.getOne.anon
    |      |       |      |      |
    |      |       |      |      └─ Exported const name (procedure)
    |      |       |      └──────── File name (operation)
    |      |       └─────────────── Subfolder
    |      └─────────────────────── Namespace folder
    └────────────────────────────── Base router path
```

---

## Naming Conventions

### File Names: Operation-Based

Files should be named after the **operation** they perform, NOT the resource (which is already implied by the folder).

**✅ CORRECT**:
```
router/
├── images/
│   ├── getOne.ts          # Gets a single image
│   ├── getMany.ts         # Gets multiple images
│   ├── createOne.ts       # Creates an image
│   ├── updateOne.ts       # Updates an image
│   ├── deleteOne.ts       # Deletes an image
│   └── analyzeOne.ts      # Analyzes an image
```

**❌ WRONG**:
```
router/
├── images/
│   ├── getImage.ts        # Redundant - already in images/ folder
│   ├── getImages.ts       # Redundant
│   ├── createImage.ts     # Redundant
```

### Standard Operation Names

Use these consistent operation patterns:

| Pattern      | Use Case                | Example                       |
| ------------ | ----------------------- | ----------------------------- |
| `getOne`     | Retrieve single item    | `users/getOne.ts`             |
| `getMany`    | Retrieve multiple items | `users/getMany.ts`            |
| `createOne`  | Create single item      | `posts/createOne.ts`          |
| `updateOne`  | Update single item      | `users/updateOne.ts`          |
| `deleteOne`  | Delete single item      | `images/deleteOne.ts`         |
| `analyzeOne` | Analyze/process item    | `images/analyzeOne.ts`        |
| `{verb}One`  | Custom single operation | `subscriptions/cancelOne.ts`  |
| `{verb}Many` | Custom batch operation  | `subscriptions/cancelMany.ts` |

### Export Names: Procedure-Based

Each file exports named constants based on the procedure type:

| Procedure Type                                        | Export Name | Example                                          |
| ----------------------------------------------------- | ----------- | ------------------------------------------------ |
| `publicQuery`, `publicMutation`, `publicAction`       | `anon`      | `export const anon = publicQuery(...)`           |
| `authQuery`, `authMutation`, `authAction`             | `authed`    | `export const authed = authQuery(...)`           |
| `serverQuery`, `serverMutation`, `serverAction`       | `server`    | `export const server = serverMutation(...)`      |
| `adminQuery`, `adminMutation`                         | `admin`     | `export const admin = adminQuery(...)`           |
| `internalQuery`, `internalMutation`, `internalAction` | `_internal` | `export const _internal = internalMutation(...)` |

---

## Procedure Selection Guide

### When to Use Each Procedure Type

**Public Procedures** (`anon`):
- ✅ Public data anyone can read
- ✅ No authentication required
- ❌ Never for sensitive data

**Authenticated Procedures** (`authed`):
- ✅ User-specific data and operations
- ✅ Requires login
- ✅ Automatically provides `ctx.user` and `ctx.userId`

**Server Procedures** (`server`):
- ✅ Called from Next.js Server Actions or API Routes
- ✅ Requires API key (`_serverKey`)
- ✅ Sensitive backend operations
- ❌ NOT callable from client-side code

**Admin Procedures** (`admin`):
- ✅ Admin-only operations
- ✅ Automatically checks for ADMIN role
- ✅ Can be triggered from Convex Dashboard

**Internal Procedures** (`_internal`):
- ✅ Called from other Convex functions
- ✅ Cron jobs, migrations, other mutations/queries
- ✅ Can be triggered from Convex Dashboard
- ❌ NOT directly callable from frontend

---

## Real-World Examples

### Example 1: User Account Route

**File**: `router/users/getAccount.ts`

```typescript
import { v } from "convex/values";
import { authQuery, adminQuery, serverQuery, userCheck } from "../../procedures";
import { getAccount } from "../../functions/users";

// Authenticated users get their own account
export const authed = authQuery({
  handler: async (ctx) => ctx.user
});

// Admins can get any user's account
export const admin = adminQuery({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await getAccount(ctx, args.userId);
    return user;
  },
});

// Server can get any user's account (for webhooks, etc.)
export const server = serverQuery({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await getAccount(ctx, args.userId);
    return user;
  },
});
```

**Frontend Usage**:
```typescript
import { api, useQuery } from '@/lib/convex/client';

// User gets their own account
const { data: user } = useQuery(api.router.users.getAccount.authed);

// Admin gets specific user's account
const { data: user } = useQuery(api.router.users.getAccount.admin, { 
  userId: "j57..." 
});
```

**Server Usage**:
```typescript
// Next.js Server Action
import { api, fetchQueryServer } from '@/lib/convex/server';

// _serverKey AUTOMATICALLY PROVIDED
const user = await fetchQueryServer(api.router.users.getAccount.server, {
  userId: "j57...",
});
```

### Example 2: Internal Mutation

**File**: `router/subscriptions/endOne.ts`

```typescript
import { v } from "convex/values";
import { internalMutation } from "../../procedures";

/**
 * Cancels all active subscriptions for a user.
 * Only callable from other Convex functions.
 */
export const _internal = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
  //  ...
});
```

**Usage from Another Mutation**:
```typescript
import { authMutation } from "../../procedures";
import { internal } from "../../_generated/api";

export const authed = authMutation({
  handler: async (ctx, args) => {
    // Call the internal mutation
    await ctx.runMutation(
      internal.router.subscriptions.endOne._internal, 
      { userId: ctx.userId }
    );
  },
});
```

### Example 3: Server Action

**File**: `router/stripe/createCheckoutUrl.ts`

```typescript
import { v } from "convex/values";
import { serverAction } from "../../procedures";
import { internal } from "../../_generated/api";
import { stripe } from "../../lib/stripe";

export const server = serverAction({
  args: {
    customerId: v.string(),
    priceId: v.string(),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // ....
    return { url }
  },
});
```

**Usage from Next.js**:
```typescript
"use server";
import { api, fetchActionServer } from "@/lib/convex/server";
import { env } from "env";

export async function createCheckout(priceId: string) {
// _serverKey automatically provided !
const session = await fetchActionServer(api.router.stripe.createCheckoutUrl.server, {
    customerId: "cus_...",
    priceId,
    successUrl: `${env.NEXT_PUBLIC_URL}/checkout/success`,
    cancelUrl: `${env.NEXT_PUBLIC_URL}/checkout/cancel`,
  });
  
  return session.url;
}
```

---

## Actions vs Mutations/Queries

### When to Use Actions

**⚠️ IMPORTANT**: Only use actions when absolutely necessary. Prefer queries and mutations.

**Use Actions For**:
- ✅ External API calls (Stripe, OpenAI, etc.)
- ✅ LLM/AI operations
- ✅ Node.js-specific libraries (`"use node"`)
- ✅ Asynchronous operations that don't fit query/mutation model

**Why Actions Are More Complex**:
Actions can't directly access database operations. You must:
1. Define mutations/queries as `_internal`
2. Import them via `internal` from `procedures.ts`
3. Call them using `ctx.runMutation()` or `ctx.runQuery()`

**Example**:
```typescript
// ❌ WRONG - Can't do this in actions
export const action = serverAction({
  handler: async (ctx, args) => {
    // This doesn't exist in action context!
    const user = await ctx.db.get(args.userId);
  },
});

// ✅ CORRECT - Use internal mutation/query
export const action = serverAction({
  handler: async (ctx, args) => {
    // Call internal query
    const user = await ctx.runQuery(
      internal.router.users.getOne._internal,
      { userId: args.userId }
    );
    
    // Now do action-specific work
    const result = await externalAPI.call(user);
    
    // Save result via internal mutation
    await ctx.runMutation(
      internal.router.results.saveOne._internal,
      { data: result }
    );
  },
});
```

### Prefer Mutations and Queries

**Mutations**:
- ✅ Direct database access
- ✅ Simpler code
- ✅ Better performance
- ✅ Automatic reactivity in frontend

**Queries**:
- ✅ Real-time reactive updates
- ✅ Automatic caching
- ✅ Direct database access

---

## Code Reusability Patterns

### Pattern 1: Functions Folder

For logic used across multiple routes, create reusable functions:

**File**: `functions/users/getAccount.ts`

```typescript
import { Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../_generated/server";

export const getAccount = async (ctx: QueryCtx, userId: Id<'users'>) => {
  const user = await ctx.db.get(userId);
  if (!user) return null;

  const userExtended = await ctx.db
    .query("usersExtended")
    .withIndex('by_user_id', (q) => q.eq("userId", userId))
    .first();

  return { ...userExtended, ...user };
};
```

**Usage in Multiple Routes**:
```typescript
// router/users/getAccount.ts
import { getAccount } from "../../functions/users";

export const authed = authQuery({
  handler: async (ctx) => {
    return await getAccount(ctx, ctx.userId);
  },
});

// router/admin/getUserDetails.ts
import { getAccount } from "../../functions/users";

export const admin = adminQuery({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await getAccount(ctx, args.userId);
  },
});
```

### Pattern 2: Internal Procedures

For operations used by other Convex functions:

```typescript
// router/notifications/sendOne.ts
export const _internal = internalMutation({
  args: { userId: v.id('users'), message: v.string() },
  handler: async (ctx, args) => {
    // ....
  },
});

// Used in other mutations
 } from "../../procedures";

await ctx.runMutation(
  internal.router.notifications.sendOne._internal,
  { userId, message: "Welcome!" }
);
```

---

## Import Best Practices

### ✅ CORRECT Imports

```typescript
// Procedures from procedures.ts (not generated files)
import { authQuery } from "../../procedures";
import { internal, api } from "../../_generated/api";

// Shared utilities
import { retryPromise } from "@shared/utils";

// Functions folder
import { getAccount } from "../../functions/users";

// Lib folder
import { stripe } from "../../lib/stripe";

// Convex validators
import { v } from "convex/values";
```

### ❌ WRONG Imports

```typescript
// DON'T import from generated files
import { query } from "../../_generated/server";

// DON'T import LLM operations in router (use llm/triggers folder instead)
import { generateText } from "ai";
```

---

## Special Folders

### `router/admin/` - Admin Operations

For administrative operations that:
- Require ADMIN role
- Are internal-only
- Can be triggered from Convex Dashboard

**Note**: Internal functions (`_internal`) can also be triggered from the Convex Dashboard, so only use `admin` procedures if the operation is user-facing and requires role checking.

```typescript
// router/admin/deleteUser.ts
import { adminMutation, internalMutation } from "../../procedures";

// User-facing admin operation (checks role)
export const admin = adminMutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userId);
  },
});

// Internal operation (no role check, dashboard-only)
export const _internal = internalMutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userId);
  },
});
```

### LLM Operations

**⚠️ IMPORTANT**: If a route uses AI/LLM, migrate it to `llm/triggers/` instead.

The `llm/triggers/` folder follows the same conventions as `router/` but is specifically for LLM-powered operations.

---

## Best Practices Summary

### ✅ DO:

1. **Follow naming conventions strictly**
   ```typescript
   // Operation name, not resource name
   router/images/getOne.ts (not getImage.ts)
   ```

2. **Use appropriate procedures**
   ```typescript
   // User data requires authentication
   export const authed = authQuery({ ... });
   ```

3. **Import from procedures.ts**
   ```typescript
   import { authQuery } from "../../procedures";
   import { internal } from "../../_generated/api";
   ```

4. **Reuse code via functions/ or _internal**
   ```typescript
   import { getAccount } from "../../functions/users";
   ```

5. **Prefer mutations/queries over actions**
   ```typescript
   // Use mutation when possible
   export const authed = authMutation({ ... });
   ```

### ❌ DON'T:

1. **Don't use redundant names**
   ```typescript
   // ❌ router/images/getImage.ts
   // ✅ router/images/getOne.ts
   ```

2. **Don't import from generated files**
   ```typescript
   // ❌ import { query } from "../../_generated/server";
   // ✅ import { publicQuery } from "../../procedures";
   ```

3. **Don't put AI logic in router/**
   ```typescript
   // ❌ router/images/analyzeOne.ts
   // ✅ llm/triggers/images/analyzeOne.ts
   ```

4. **Don't use actions unnecessarily**
   ```typescript
   // ❌ export const action = authAction({ ... });
   // ✅ export const authed = authMutation({ ... });
   ```

---

## Quick Reference

### File Path to API Call Mapping

| File Path                                                | API Call                                 |
| -------------------------------------------------------- | ---------------------------------------- |
| `router/users/getOne.ts` → `export const authed`         | `api.router.users.getOne.authed`         |
| `router/storage/images/getMany.ts` → `export const anon` | `api.router.storage.images.getMany.anon` |
| `router/admin/deleteUser.ts` → `export const admin`      | `api.router.admin.deleteUser.admin`      |
| `router/stripe/webhook.ts` → `export const server`       | `api.router.stripe.webhook.server`       |

### Procedure Selection Chart

```
Called from within Convex (cron, other mutations/queries)?
  └─ Yes → internalQuery/internalMutation/internalAction (_internal)
      Note: NO authentication needed

Called from external services?
  └─ Yes
      ├─ Need authentication?
      │   ├─ No → publicQuery/publicMutation/publicAction (anon)
      │   └─ Yes
      │       ├─ Called from client (browser)?
      │       │   ├─ Admin only → adminQuery/adminMutation (admin)
      │       │   └─ Regular user → authQuery/authMutation (authed)
      │       └─ Called from external backend (Next.js Server Actions/API Routes)?
      │           └─ serverQuery/serverMutation/serverAction (server)
```

---

## Router Usage in External Environments (Front-end / Back-end)

### Import Pattern

**⚠️ CRITICAL**: Never import from Convex generated files (`convex/_generated/api`).

### Client-Side (Browser / App)

**File**: `@/lib/convex/client`

Auth variables are automatically passed in the client hooks. No need to specify useQueryAuth etc..

```typescript
"use client"
import { api, useQuery, useMutation, useAction } from '@/lib/convex/client';

export const ClientComponent = () => {
  // Query with reactive updates
  const { data, isPending } = useQuery(
    api.router.examples.query.anon, 
    { name: 'John' }
  );

  // Mutation with loading states
  const { execute, isLoading, isSuccess, isError } = useMutation(
    api.router.users.updateOne.authed
  );

  const handleUpdate = async () => {
    const result = await runAction({ name: 'Jane' });
  };

  // Action
  const { execute: runAction } = useAction(
    api.router.stripe.createCheckout.authed
  );

  return <div>{data}</div>;
};
```

**Available Exports**:
- `api` - Type-safe API object
- `useQuery` - Reactive queries with automatic caching
- `useMutation` - Mutations with loading states
- `useAction` - Actions with loading states
- `useQueryCached` - Cached queries
- `usePaginatedQuery` - Paginated queries
- `useConvex` - Convex client instance

### Server-Side (Next.js Server Actions / API Routes)

**File**: `@/lib/convex/server`

```typescript
import { api, fetchQuery, fetchQueryServer, fetchMutationServer, fetchActionServer } from "@/lib/convex/server";

export default async function ServerComponent() {
  // Server query - _serverKey automatically included
  const message = await fetchQueryServer(
    api.router.examples.query.server, 
    { name: 'Anonymous' }
  );

  // Anon query - no key needed
  const image = await fetchQuery(
    api.router.storage.images.getOne.anon,
    { imageId: 'image_xxxx' }
  );

  return <div>{message}</div>;
}

// Server Action
export async function updateUser(formData: FormData) {
  "use server"
  
  // Server mutation - _serverKey automatically included
  const result = await fetchMutationServer(
    api.router.users.updateOne.server,
    { name: formData.get('name') as string }
  );

  // Server action - _serverKey automatically included
  const checkout = await fetchActionServer(
    api.router.stripe.createCheckout.server,
    { priceId: 'price_xxx' }
  );

  return result;
}
```

**Available Exports**:
- `api` - Type-safe API object
- `fetchQueryServer` - Fetch queries with `_serverKey` auto-included
- `fetchMutationServer` - Fetch mutations with `_serverKey` auto-included
- `fetchActionServer` - Fetch actions with `_serverKey` auto-included
- `fetchQueryAuth` - Fetch queries with user authentication
- `fetchMutationAuth` - Fetch mutations with user authentication
- `fetchActionAuth` - Fetch actions with user authentication
- `preloadQuery` - Preload queries for React Server Components
- `preloadQueryAuth` - Preload queries with authentication

**⚠️ IMPORTANT**: The `*Server` functions (`fetchQueryServer`, `fetchMutationServer`, `fetchActionServer`) automatically include the `_serverKey` parameter. You don't need to pass it manually.

### Type-Only Imports

**File**: `@/lib/convex/api`

```typescript
import type { Api, Id, Doc } from '@/lib/convex/api';

// Use for type annotations only
type UserId = Id<'users'>;
type User = Doc<'users'>;
```

**Available Exports**:
- `api` - Type-safe API object (types only)
- `Api` - TypeScript type for the entire API
- `Id<TableName>` - Type for Convex IDs
- `Doc<TableName>` - Type for Convex documents

### Import Comparison

| Environment       | Import From                | Purpose                        |
| ----------------- | -------------------------- | ------------------------------ |
| Client Components | `@/lib/convex/client`      | React hooks + api              |
| Server Components | `@/lib/convex/server`      | Fetch functions + api          |
| Type Definitions  | `@/lib/convex/api`         | Types only (Id, Doc, Api, api) |
| ❌ Never Use       | `convex/_generated/api`    | Internal generated file        |
| ❌ Never Use       | `convex/_generated/server` | Internal generated file        |

### Key Benefits

1. **Automatic `_serverKey` handling**: Server functions automatically include the required API key
2. **Type safety**: Full TypeScript support with autocomplete
3. **Consistent imports**: One source of truth for each environment
4. **Enhanced features**: Additional utilities like loading states for mutations/actions
5. **Authentication helpers**: Separate functions for authenticated vs server calls

---

## Summary

The `router/` folder provides:

- ✅ **Structured API organization** with clear naming conventions
- ✅ **Type-safe routes** that map directly to frontend calls
- ✅ **Multiple access levels** (public, authenticated, server, admin, internal)
- ✅ **Code reusability** via functions and internal procedures
- ✅ **Clear separation** between queries, mutations, and actions
- ✅ **Consistent patterns** across the entire application

**Golden Rules**:
1. **Folder/file names** → operation-based, not resource-based
2. **Export names** → procedure-based (anon, authed, server, admin, _internal)
3. **Import procedures** → from `procedures.ts`, never from generated files
4. **Import API/hooks** → from `@/lib/convex/client` or `@/lib/convex/server`, never from generated files
5. **Prefer mutations** → over actions when possible
6. **AI operations** → belong in `llm/triggers/`, not `router/`