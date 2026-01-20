# Convex Backend Documentation - LLM Summary

## Quick Overview

This is a **Next.js + Convex** boilerplate. Convex is a serverless backend providing real-time database, authentication, file storage, and scheduled functions.

**⚠️ CRITICAL**: Convex uses **camelCase** for all naming (files, functions, variables).

---

## Documentation Structure

This folder contains comprehensive documentation for the Convex backend. Each file focuses on a specific aspect:

| File                     | Purpose                                                       | Read When                                |
| ------------------------ | ------------------------------------------------------------- | ---------------------------------------- |
| **ROOT.md**              | Main overview, configuration, directory structure             | Starting point - read first              |
| **CONVEX_PROCEDURES.md** | Custom procedures (publicQuery, authQuery, serverQuery, etc.) | Before writing ANY Convex code           |
| **CONVEX_ROUTER.md**     | API routes, naming conventions, external access               | Creating routes or calling from frontend |
| **CONVEX_SCHEMA.md**     | Database schema, tables, indexes                              | Working with database                    |
| **CONVEX_FUNCTIONS.md**  | Reusable database logic                                       | Creating shared logic                    |
| **CONVEX_LIB.md**        | Third-party integrations (Stripe, etc.)                       | Adding external services                 |
| **CONVEX_LLM.md**        | AI/LLM integration, agents, RAG                               | Working with AI features                 |
| **CONVEX_MIGRATIONS.md** | Database migrations                                           | Changing schema                          |
| **CONVEX_HTTP.md**       | HTTP routes, webhooks                                         | Adding webhooks                          |
| **CONVEX_CRON.md**       | Scheduled jobs                                                | Creating recurring tasks                 |
| **CONVEX_ENV.md**        | Environment variables                                         | Using env vars in Convex                 |

---

## Critical Rules (READ FIRST)

### 1. Import Procedures Correctly
```typescript
// ✅ ALWAYS
import { authQuery, publicQuery } from "../../procedures";
import { internal } from "../../_generated/api";

// ❌ NEVER
import { query } from "../../_generated/server";
```

### 2. Router Naming Convention
```typescript
// File: router/users/getOne.ts (operation-based, NOT getUser.ts)
export const anon = publicQuery({ ... });      // Public
export const authed = authQuery({ ... });      // Authenticated users
export const admin = adminQuery({ ... });      // Admin only
export const server = serverQuery({ ... });    // External backend (Next.js)
export const _internal = internalQuery({ ... }); // Convex internal
```

### 3. Frontend/Backend Access
```typescript
// Client-side (browser)
import { api, useQuery, useMutation } from '@/lib/convex/client';
const { data } = useQuery(api.router.users.getOne.authed);

// Server-side (Next.js)
import { api, fetchQueryServer, fetchQuery } from '@/lib/convex/server';
const data = await fetchQueryServer(api.router.users.getOne.server);
const data = await fetchQuery(api.router.users.getOne.anon);
// _serverKey automatically included!
```

### 4. Procedure Selection
```
Internal Convex call (cron, other mutations)?
  → internalQuery/internalMutation/internalAction (_internal)
  
External call from browser?
  → No auth: publicQuery/publicMutation (anon)
  → User auth: authQuery/authMutation (authed)
  → Admin: adminQuery/adminMutation (admin)
  
External call from Next.js backend?
  → serverQuery/serverMutation/serverAction (server)
```

### 5. LLM Operations
```typescript
// ✅ ALWAYS use default agent
import { defaultAgent } from "../../llm/agents/default";
const result = await defaultAgent.generateText({ ... });

// ❌ NEVER import AI SDK directly
import { generateText } from "ai"; // WRONG!
```

---

## Folder Structure

```
convex/
├── procedures.ts          # Custom procedures (MOST IMPORTANT)
├── schema.ts              # Database schema
├── migrations.ts          # Schema migrations
├── http.ts                # HTTP routes/webhooks
├── cron.ts                # Scheduled jobs
├── env.ts                 # Environment variables
├── router/                # API endpoints (MOST IMPORTANT FOLDER)
│   ├── users/
│   ├── storage/images/
│   └── stripe/
├── functions/             # Reusable DB logic
│   ├── users/
│   └── subscriptions/
├── lib/                   # Third-party integrations
│   ├── stripe/
│   └── image/
├── llm/                   # AI/LLM integration
│   ├── agents/
│   ├── config/
│   ├── rag/
│   ├── tools/
│   └── triggers/
└── schema/                # Table definitions
    ├── users.ts
    └── images.ts
```

---

## Common Patterns

### Creating a New Route
1. Choose folder: `router/{domain}/{operation}.ts`
2. Import procedures: `import { authQuery } from "../../procedures"`
3. Export with correct name: `export const authed = authQuery({ ... })`
4. Call from frontend: `useQuery(api.router.{domain}.{operation}.authed)`

📖 **Read**: CONVEX_ROUTER.md for complete patterns

### Reusable Logic
- Database operations → `functions/` folder
- External API calls → `lib/` folder
- AI operations → `llm/` folder

📖 **Read**: CONVEX_FUNCTIONS.md, CONVEX_LIB.md, CONVEX_LLM.md

### Authentication
- `ctx.userId` - Current user ID (in authQuery/authMutation)
- `ctx.user` - Current user object (with userCheck helper)
- Server procedures use `_serverKey` (auto-included by fetchQueryServer)

📖 **Read**: CONVEX_PROCEDURES.md

---

## Import Aliases

| Alias                 | Points To                   | Use Case                    |
| --------------------- | --------------------------- | --------------------------- |
| `@shared/utils`       | `utils/convex-allowed/`     | Cross-environment utilities |
| `@/lib/*`             | `convex/lib/*`              | Lib folder imports          |
| `../../procedures`    | `convex/procedures.ts`      | Procedures (ALWAYS)         |
| `../../functions/*`   | `convex/functions/*`        | Reusable functions          |
| `@/lib/convex/client` | `expo/lib/convex/client.ts` | React Native hooks          |

**Note**: `expo/lib/convex/server.ts` exists for legacy compatibility but is not used in React Native.

---

## Quick Navigation

**Need to**:
- Understand procedures? → `CONVEX_PROCEDURES.md`
- Create API routes? → `CONVEX_ROUTER.md`
- Define database tables? → `CONVEX_SCHEMA.md`
- Add AI features? → `CONVEX_LLM.md`
- Share code with Next.js? → `ROOT.md` (see @shared/utils)
- Add webhooks? → `CONVEX_HTTP.md`
- Schedule tasks? → `CONVEX_CRON.md`
- Change schema? → `CONVEX_MIGRATIONS.md`
- Use env vars? → `CONVEX_ENV.md`

**Start with**: `ROOT.md` for overview, then `CONVEX_PROCEDURES.md` before writing code.

---

## Technology Stack

- **Database**: Convex (real-time, serverless)
- **Auth**: @convex-dev/auth
- **AI**: @convex-dev/agent, @convex-dev/rag, OpenRouter (Gemini, Grok, GPT), Voyage AI embeddings
- **Payments**: Stripe
- **Frontend**: Next.js 16+ with React 19
- **State**: Jotai
- **Package Manager**: PNPM

---

## Remember

1. **Always** import procedures from `procedures.ts`, never from generated files
2. **Router naming**: operation-based files (getOne.ts), procedure-based exports (anon, authed, server)
3. **Server functions** automatically include `_serverKey` - don't pass it manually
4. **LLM operations** always use default agent, never direct AI SDK imports
5. **camelCase** for everything in Convex
6. Read specific documentation files for detailed patterns and examples
