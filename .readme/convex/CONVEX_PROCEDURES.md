# Convex Procedures Documentation

## Overview

The `procedures.ts` file is the **most critical file** in the Convex architecture. It serves as the central hub for all procedure imports and exports custom procedures with built-in authentication, authorization, and security patterns.

**⚠️ CRITICAL RULE**: NEVER import directly from Convex generated files. ALWAYS import from `procedures.ts`.

---

## Why Use procedures.ts?

1. **Consistency** - Single source of truth for all procedure types
2. **Security** - Built-in authentication and authorization patterns
3. **Type Safety** - Centralized type exports
4. **Maintainability** - Easy to update authentication logic across entire app
5. **Best Practices** - Enforces correct usage patterns

---

## Import Patterns

### ❌ WRONG - Never Do This:

```typescript
// DON'T import from generated files EXCEPT { internal & api }
import { internalMutation } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { query } from "./_generated/server";
import { type QueryCtx } from "./_generated/server";
```

### ✅ CORRECT - Always Do This:

```typescript
// Import procedures from procedures.ts
import { publicQuery, authMutation, internalMutation } from "../../procedures";
import { type QueryCtx, type MutationCtx } from "../../procedures";
// Import api/internal from _generated/api to avoid circular dependencies
import { internal, api } from "../../_generated/api";
```

**Single-line imports for multiple procedures**:
```typescript
import { 
  publicQuery, 
  authQuery, 
  authMutation,
  serverMutation,
  adminQuery,
  type QueryCtx,
  type MutationCtx 
} from "../../procedures";

import { 
  api, 
  internal, 
} from "../../_generated/api";
```

---

## Exported Items

### Re-exports from Convex

Standard Convex exports re-exported for convenience:

```typescript
// ⚠️ These are NOT re-exported from procedures.ts to avoid circular dependencies
// Import directly from _generated/api:
// import { internal, api } from "../../_generated/api";

// Internal procedures (only callable from other Convex functions)
// These ARE re-exported from procedures.ts:
export { internalQuery, internalMutation } from "./_generated/server";

// TypeScript types
export type { MutationCtx, QueryCtx, ActionCtx } from './_generated/server';
```

**Important**: `api` and `internal` are NOT exported from `procedures.ts` because it would create a circular dependency. Always import them from `_generated/api`:

---

## Naming Convention for Procedures

**⚠️ CRITICAL**: All procedure exports MUST follow this naming convention:

| Procedure Type                                        | Export Name | Example                                          |
| ----------------------------------------------------- | ----------- | ------------------------------------------------ |
| `publicQuery`, `publicAction`, `publicMutation`       | `anon`      | `export const anon = publicQuery(...)`           |
| `authQuery`, `authMutation`, `authAction`             | `authed`    | `export const authed = authQuery(...)`           |
| `serverQuery`, `serverMutation`, `serverAction`       | `server`    | `export const server = serverMutation(...)`      |
| `adminQuery`, `adminMutation`, `adminAction`          | `admin`     | `export const admin = adminMutation(...)`        |
| `internalQuery`, `internalMutation`, `internalAction` | `_internal` | `export const _internal = internalMutation(...)` |

**Why This Convention?**
- **Consistency**: Easy to identify procedure type at a glance
- **Organization**: Clear structure across all route files
- **Predictability**: Always know what to expect in each file

**Examples**:
```typescript
// ✅ CORRECT
export const anon = publicQuery({ ... });
export const authed = authQuery({ ... });
export const server = serverMutation({ ... });
export const admin = adminMutation({ ... });
export const _internal = internalMutation({ ... });

// ❌ WRONG
export const getUser = publicQuery({ ... });
export const listPosts = authQuery({ ... });
export const processWebhook = serverMutation({ ... });
```

---

## Custom Procedures

### 1. Public Procedures (No Authentication)

**Available Procedures**:
- `publicQuery` - Read-only operations, no auth required
- `publicAction` - Server actions, no auth required

**When to Use**:
- Public-facing data (blog posts, product listings)
- Landing page content
- Anonymous operations

**Example**:
```typescript
// convex/router/blog/listPosts.ts
import { publicQuery } from "../../procedures";
import { v } from "convex/values";

export const anon = publicQuery({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("posts")
      .filter(q => q.eq(q.field("published"), true))
      .take(limit);
  },
});
```

---

### 2. Authenticated Procedures (User Required)

**Available Procedures**:
- `authQuery` - Read-only operations requiring authenticated user
- `authMutation` - Write operations requiring authenticated user

**Context Additions**:
- `ctx.user` - Full user object with extended fields
- `ctx.userId` - User ID (shorthand)

**User Object Structure**:
```typescript
{
  // From usersExtended table
  _idExtended: Id<'usersExtended'>,
  userId: Id<'users'>,
  canTakeFreeTrial: boolean,
  stripeCustomerId: string,
  firstName?: string,
  lastName?: string,
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'FLAGGED' | 'SUSPENDED',
  role: 'ADMIN' | 'USER' | 'GUEST',
  
  // From users table (merged)
  _id: Id<'users'>,
  name?: string,
  email?: string,
  image?: string,
  emailVerificationTime?: number,
  // ... other auth fields
}
```

**Example Query**:
```typescript
// convex/router/users/getProfile.ts
import { authQuery } from "../../procedures";

export const authed = authQuery({
  args: {},
  handler: async (ctx, args) => {
    // ctx.user and ctx.userId are automatically available
    return {
      name: ctx.user.name,
      email: ctx.user.email,
      role: ctx.user.role,
      canTrial: ctx.user.canTakeFreeTrial,
    };
  },
});
```

**Example Mutation**:
```typescript
// convex/router/users/updateProfile.ts
import { authMutation } from "../../procedures";
import { v } from "convex/values";

export const authed = authMutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Update the current user's extended profile
    await ctx.db.patch(ctx.user._idExtended, {
      firstName: args.firstName,
      lastName: args.lastName,
    });
    
    return { success: true };
  },
});
```

**Called from Next.js Client**:
```typescript
"use client";
import { useMutation, api } from "@/lib/convex/client";

export function ProfileForm() {
  const updateProfile = useMutation(api.router.users.updateProfile.authed);
  
  const handleSubmit = async (data) => {
    await updateProfile({
      firstName: data.firstName,
      lastName: data.lastName,
    });
  };
  
  // ...
}
```

---

### 3. Server Procedures (Next.js Server ↔ Convex)

**Available Procedures**:
- `serverQuery` - Read operations from Next.js Server Actions/API Routes
- `serverMutation` - Write operations from Next.js Server Actions/API Routes
- `serverAction` - Actions from Next.js Server Actions/API Routes

**Security**: Requires `_serverKey` parameter that matches `SERVER_PRIVATE_KEY` environment variable.

**⚠️ IMPORTANT**: 
- Only callable from Next.js **server-side** code (Server Actions, Route Handlers)
- NOT accessible from client-side code
- Key must be kept secret

**Example Convex Procedure**:
```typescript
// convex/router/stripe/processStripeEvent.ts
import { serverMutation } from "../../procedures";
import { v } from "convex/values";

export const server = serverMutation({
  args: {
    customerId: v.string(),
  },
  handler: async (ctx, args) => {
    // ....
    return { success: true };
  },
});
```

**Calling from Next.js Server Action**:
```typescript
// src/app/actions/stripe-webhook.ts
"use server";

import { api, fetchQuery, fetchMutationServer } from "@/lib/convex/server";

export async function handleStripeWebhook(event: StripeEvent) {
  // _serverKey automatically added
  const result = await fetchMutationServer(api.router.webhooks.processStripeEvent.server, {
    customerId: event.data.object.customer });

  // Anon query - no key needed
  const image = await fetchQuery(api.router.storage.images.getOne.anon, {
     imageId: 'image_xxxx' });
  
  return result;
}
```

**Environment Setup**:
```bash
# .env.local (Next.js)
CONVEX_SERVER_TOKEN=your-secret-key-here

# Convex Dashboard → Settings → Environment Variables
SERVER_PRIVATE_KEY=your-secret-key-here
```

---

### 4. Admin Procedures (Admin Role Required)

**Available Procedures**:
- `adminQuery` - Read operations requiring ADMIN role
- `adminMutation` - Write operations requiring ADMIN role

**Authorization Flow**:
1. Checks if user is authenticated
2. Verifies user role is 'ADMIN'
3. Throws error if not admin

**Example**:
```typescript
// convex/router/admin/deleteUser.ts
import { adminMutation } from "../../procedures";
import { v } from "convex/values";

export const admin = adminMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Only ADMIN users can reach this point
    //  ...

    return { success: true };
  },
});
```

---

### 5. Internal Procedures (Convex-to-Convex Only)

**Available Procedures**:
- `internalQuery` - Internal read operations
- `internalMutation` - Internal write operations

**Usage**: Only callable from other Convex functions (cron jobs, other mutations, actions).

**Example**:
```typescript
// convex/router/sessions/cleanup.ts
import { internalMutation } from "../../procedures";

export const _internal = internalMutation({
  args: {},
  handler: async (ctx, args) => {
    // ...
    
    return { deleted: expiredSessions.length };
  },
});
```

**Called from somewhere**:
```typescript
// convex/router/somewhere.ts
import { internal } from "../../_generated/api";

await ctx.scheduler.runAt(0, internal.router.subscriptions.createSubscription._internal, {});
```

---

## Implementation Details

### Authentication Flow

```
Client Request
    ↓
authQuery/authMutation
    ↓
userCheckOrThrow(ctx)
    ↓
getAuthUserId(ctx) ← Convex Auth
    ↓
Query users & usersExtended tables
    ↓
Merge user data
    ↓
Add to context: { user, userId }
    ↓
Handler executes
    ↓
Return result
```

---

## Procedure Comparison Table

| Procedure Type     | Auth Required | Role Check | Callable From  | Use Case                 |
| ------------------ | ------------- | ---------- | -------------- | ------------------------ |
| `publicQuery`      | ❌ No          | ❌ No       | Client, Server | Public data              |
| `publicAction`     | ❌ No          | ❌ No       | Client, Server | Public operations        |
| `authQuery`        | ✅ Yes         | ❌ No       | Client, Server | User-specific reads      |
| `authMutation`     | ✅ Yes         | ❌ No       | Client, Server | User-specific writes     |
| `serverQuery`      | 🔑 API Key     | ❌ No       | Server only    | Server-to-server reads   |
| `serverMutation`   | 🔑 API Key     | ❌ No       | Server only    | Server-to-server writes  |
| `serverAction`     | 🔑 API Key     | ❌ No       | Server only    | Server-to-server actions |
| `adminQuery`       | ✅ Yes         | ✅ ADMIN    | Client, Server | Admin reads              |
| `adminMutation`    | ✅ Yes         | ✅ ADMIN    | Client, Server | Admin writes             |
| `internalQuery`    | ❌ No          | ❌ No       | Convex only    | Internal reads           |
| `internalMutation` | ❌ No          | ❌ No       | Convex only    | Internal writes          |

---

## Best Practices

### ✅ DO:

1. **Always import from procedures.ts**
   ```typescript
   import { authQuery } from "../../procedures";
   import { api } from "../../_generated/api";
   ```

2. **Use the most restrictive procedure that fits your needs**
   ```typescript
   // If user auth needed, use authQuery (not publicQuery)
   export const authed = authQuery({ ... });
   ```

3. **Leverage automatic context additions**
   ```typescript
   export const authed = authMutation({
     handler: async (ctx, args) => {
       // ctx.user and ctx.userId are already available!
       await ctx.db.patch(ctx.user._idExtended, { ... });
     },
   });
   ```

4. **Use server procedures for sensitive operations**
   ```typescript
   // Keep API keys on server, use serverMutation
   export const server = serverMutation({ ... });
   ```

5. **Export types from procedures.ts**
   ```typescript
   import { type QueryCtx, type MutationCtx } from "../../procedures";
   ```

### ❌ DON'T:

1. **Don't bypass procedures.ts**
   ```typescript
   // ❌ WRONG
   import { query } from "./_generated/server";
   ```

2. **Don't expose _serverKey in client code**
   ```typescript
   // ❌ WRONG - Never do this in client components
   const result = await mutation({ _serverKey: "secret", ... });
   ```

3. **Don't manually check auth in handlers**
   ```typescript
   // ❌ WRONG - Use authQuery instead
   export const anon = publicQuery({
     handler: async (ctx, args) => {
       const userId = await getAuthUserId(ctx);
       if (!userId) throw new Error("Unauthorized");
       // ...
     },
   });
   ```

4. **Don't use wrong procedure type**
   ```typescript
   // ❌ WRONG - Use authQuery for user operations
   export const authed = publicQuery({ ... });
   ```

---

## Summary

The `procedures.ts` file provides:

- ✅ **Centralized import source** for all Convex procedures
- ✅ **Built-in authentication** via `authQuery` and `authMutation`
- ✅ **Role-based authorization** via `adminQuery` and `adminMutation`
- ✅ **Server-to-server security** via `serverQuery`, `serverMutation`, `serverAction`
- ✅ **Type safety** with re-exported TypeScript types
- ✅ **Consistency** across entire codebase
- ✅ **Automatic context enhancement** (user data injection)

**Golden Rule**: Never import from `_generated/` files directly. Always use `procedures.ts`.