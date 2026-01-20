# Convex Root Directory Documentation

## Overview

The `convex/` directory contains all backend logic, database schema, and API endpoints for the application. Convex provides a serverless backend with real-time database capabilities, file storage, and scheduled functions.

**⚠️ CRITICAL NAMING CONVENTION**: Convex uses **camelCase** for all naming (files, functions, variables, etc.)

---

## Configuration Files

### `tsconfig.json` - TypeScript Configuration

Defines TypeScript settings and import aliases for the Convex environment:

- `@shared/utils` → Points to `utils/convex-allowed/`
- `@/lib/*` → Points to `convex/lib/*`

These aliases allow sharing code between Convex and Next.js environments.

### `convex.json` - External Dependencies

**⚠️ IMPORTANT**: This file is located at the **project root** (next to `package.json`), NOT in the `convex/` folder. It's documented here because it configures the Convex environment.

Defines Node.js packages that Convex should install on deployment.

**Current Configuration**:
```json
{
  "node": {
    "externalPackages": [
      "sharp"
      // ...
    ]
  }
}
```

**Key Points**:
- Only Node.js packages needed for actions with `"use node"` directive
- No package.json needed (unless you want version locking)
- Packages are installed automatically on deployment
- Used for heavy libraries that require Node.js runtime
- Only used by libraries that are not cross-platform compatible (like "sharp")

---

## Core Files

### `procedures.ts` - Custom Procedures

Defines all custom procedures (publicQuery, authQuery, serverQuery, adminQuery, internalQuery, etc.) used throughout the app. This is the **most important file** for understanding authentication and access control patterns.

📖 **See**: `CONVEX_PROCEDURES.md` for complete procedure types and usage.

---

### `schema.ts` - Database Schema

Central schema definition that imports and combines all table schemas from `schema/` folder. Defines the complete database structure including tables for auth, users, images, subscriptions, etc.

**Example**:
```typescript
export default defineSchema({
  ...authTables,
  usersExtended,
  images,
  subscriptions,
});
```

📖 **See**: `CONVEX_SCHEMA.md` for table definitions and schema patterns.

---

### `migrations.ts` - Database Migrations

Manages schema migrations using `@convex-dev/migrations`. Defines migration functions and runners for updating existing data when schema changes.

**Example**:
```typescript
export const clearImagesTags = migrations.define({
  table: "images",
  migrateOne: () => ({ tags: [] }),
});
```

📖 **See**: `CONVEX_MIGRATIONS.md` for migration patterns and best practices.

---

### `http.ts` - HTTP Routes

Defines HTTP endpoints for webhooks and external API calls. Handles incoming HTTP requests (e.g., Stripe webhooks) and routes them to appropriate handlers.

**Example**:
```typescript
http.route({
  path: "/api/webhooks/stripe",
  method: "POST",
  handler: stripeWebhookHttpAction,
});
```

📖 **See**: `CONVEX_HTTP.md` for HTTP routing and webhook patterns.

---

### `cron.ts` - Scheduled Jobs

Defines scheduled/recurring tasks using Convex cron jobs. Used for periodic maintenance, cleanup, or automated tasks.

**Example**:
```typescript
crons.interval(
  "cleanup",
  { hours: 24 },
  internal.maintenance.cleanupOldData,
);
```

📖 **See**: `CONVEX_CRON.md` for scheduling patterns and examples.

---

### `auth.ts` & `auth.config.ts` - Authentication

- `auth.config.ts` - Authentication provider configuration (OAuth, email/password)
- `auth.ts` - Authentication functions and user creation logic

These files integrate with `@convex-dev/auth` for complete auth management.

📖 **See**: Dedicated authentication documentation for details.

---

## Directory Structure

### `functions/` - Reusable Database Logic

Contains reusable query/mutation logic that can be called from multiple routes. Organized by domain (users, images, subscriptions). These are **NOT** directly callable from the frontend.

**Example Structure**:
```
functions/
├── users/
│   ├── getAccount.ts    # Reusable user account logic
│   └── index.ts         # Barrel export
└── subscriptions/
    └── getUserSubscription.ts
```

📖 **See**: `CONVEX_FUNCTIONS.md` for organization patterns and usage.

---

### `lib/` - Third-Party Integrations

Contains utilities for third-party services (Stripe, image processing, etc.). Used for external API clients and helper functions that don't directly query the database.

**Example Structure**:
```
lib/
├── stripe/
│   ├── index.ts         # Barrel export
│   └── createCustomer.ts
└── image/
    └── sanitizeImage.ts
```

📖 **See**: `CONVEX_LIB.md` for lib organization and barrel export patterns.

---

### `llm/` - AI/LLM Integration

Contains all AI/LLM related code including agents, RAG, tools, and triggers. Centralized location for AI operations with usage tracking and model configuration.

**Example Structure**:
```
llm/
├── agents/              # AI agents (always use default agent)
├── config/              # Model & provider configuration
├── rag/                 # RAG embeddings & search
├── tools/               # Custom AI tools
└── triggers/            # LLM-powered routes
```

📖 **See**: `CONVEX_LLM.md` for AI integration patterns and best practices.

---

### `router/` - API Routes (Public Endpoints)

The **most important folder** - contains all routes callable from external environments (Next.js frontend, webhooks, server actions). Organized by domain with strict naming conventions that map directly to frontend API calls.

**Access from external frameworks**:
- Client-side: `@/lib/convex/client` (useQuery, useMutation, useAction)
- Server-side: `@/lib/convex/server` (fetchQuery, fetchMutation, fetchAction, fetchQueryAuth, fetchMutationAuth, fetchActionAuth, fetchQueryServer, fetchMutationServer, fetchActionServer, preloadQuery, preloadQueryAuth)

**Example Structure**:
```
router/
├── users/
│   ├── getOne.ts        # exports: anon, authed, admin, server
│   └── updateOne.ts
├── storage/images/
│   ├── getOne.ts
│   └── createOne.ts
└── stripe/
    └── createCheckoutUrl.ts
```

📖 **See**: `CONVEX_ROUTER.md` for routing conventions, procedure selection, and usage patterns.

---

## App Components

Convex uses a modular "app component" system for additional capabilities:

**Currently Enabled**:
- `@convex-dev/migrations` - Database migrations
- `@convex-dev/auth` - Authentication
- `@convex-dev/agent` - AI agents
- `@convex-dev/action-cache` - Action result caching
- `@convex-dev/rag` - RAG (Retrieval-Augmented Generation)

These are configured in the Convex dashboard and automatically integrated.

---

## Best Practices

### ✅ DO:
1. Use `procedures.ts` for all imports
2. Follow camelCase naming convention
3. Organize routes by domain in `router/`
4. Extract reusable logic to `functions/`
5. Use `env.ts` for environment variables
6. Define migrations for schema changes
7. Index frequently queried fields

### ❌ DON'T:
1. Import from `_generated/server` or `_generated/api` directly
2. Use `process.env` in Convex code
3. Mix database logic in `lib/` folder
4. Forget to add indexes for queries
5. Skip migrations when changing schema

---

## Quick Reference

| File/Folder     | Purpose             | Import From                     |
| --------------- | ------------------- | ------------------------------- |
| `schema.ts`     | Database schema     | Auto-imported                   |
| `procedures.ts` | Custom procedures   | `../../procedures`              |
| `functions/`    | Reusable DB logic   | `../../functions/{domain}`      |
| `lib/`          | Third-party utils   | `../../lib/{service}`           |
| `router/`       | API endpoints       | Called from Next.js via `api.*` |
| `env.ts`        | Environment vars    | `../../env`                     |
| `@shared/utils` | Cross-env utilities | `@shared/utils`                 |
| `@/lib/*`       | Lib alias           | `@/lib/{service}`               |

---

## Summary

The Convex root directory provides a well-organized backend architecture with:
- ✅ Type-safe database schema with automatic migrations
- ✅ Custom procedures with built-in authentication
- ✅ Modular functions for code reusability
- ✅ HTTP endpoints for webhooks and external APIs
- ✅ Scheduled functions for recurring tasks
- ✅ AI/LLM integration capabilities
- ✅ Clear separation between routes, functions, and utilities

This structure ensures scalability, maintainability, and developer productivity.