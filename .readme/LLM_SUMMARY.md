# Full-Stack Boilerplate Documentation - LLM Summary

## Project Overview

This is a **Convex + React Native (Expo)** full-stack application boilerplate for rapid development of modern mobile and web applications with real-time backend capabilities.

**Tech Stack**:
- **Frontend**: Expo (React Native) with Expo Router for iOS, Android, and Web
- **Backend**: Convex (real-time database, serverless functions)
- **UI**: NativeWind (Tailwind CSS for React Native)
- **State**: Jotai
- **i18n**: react-i18next
- **Analytics**: PostHog (React Native)
- **Payments**: Stripe
- **AI**: @convex-dev/agent, @convex-dev/rag, OpenRouter
- **Package Manager**: PNPM (or npm/yarn)

**⚠️ CRITICAL NAMING CONVENTIONS**:
- **Convex**: camelCase for everything (files, functions, variables)
- **Expo**: kebab-case for files, CamelCase inside, `_functionName` for private

---

## Documentation Structure

### Root Documentation

| File                | Purpose                                                       |
| ------------------- | ------------------------------------------------------------- |
| **ROOT.md**         | Main overview, project architecture, quick start              |
| **LLM_SUMMARY.md**  | This file - complete quick reference                          |
| **TRANSLATIONS.md** | Translation conventions & usage (see .readme/TRANSLATIONS.md) |

### Convex Backend ([convex/](./convex/))

| File                     | Purpose                                                       | Read When                                |
| ------------------------ | ------------------------------------------------------------- | ---------------------------------------- |
| **ROOT.md**              | Convex overview, configuration, directory structure           | Starting with backend                    |
| **LLM_SUMMARY.md**       | Convex quick reference                                        | Quick backend reminder                   |
| **CONVEX_PROCEDURES.md** | Custom procedures (publicQuery, authQuery, serverQuery, etc.) | Before writing ANY Convex code           |
| **CONVEX_ROUTER.md**     | API routes, naming conventions, external access               | Creating routes or calling from frontend |
| **CONVEX_SCHEMA.md**     | Database schema, tables, indexes                              | Working with database                    |
| **CONVEX_FUNCTIONS.md**  | Reusable database logic                                       | Creating shared logic                    |
| **CONVEX_LIB.md**        | Third-party integrations (Stripe, etc.)                       | Adding external services                 |
| **CONVEX_LLM.md**        | AI/LLM integration, agents, RAG                               | Working with AI features                 |
| **CONVEX_MIGRATIONS.md** | Database migrations                                           | Changing schema                          |
| **CONVEX_HTTP.md**       | HTTP routes, webhooks                                         | Adding webhooks                          |
| **CONVEX_CRON.md**       | Scheduled jobs                                                | Creating recurring tasks                 |
| **CONVEX_ENV.md**        | Environment variables in Convex                               | Using env vars in Convex                 |

### Expo/React Native Application ([expo/](./expo/)) (formerly src/)

| File                   | Purpose                                                 | Read When                  |
| ---------------------- | ------------------------------------------------------- | -------------------------- |
| **ROOT.md**            | Expo overview, structure, naming conventions            | Starting with frontend     |
| **LLM_SUMMARY.md**     | Expo quick reference                                    | Quick frontend reminder    |
| **EXPO_HOOKS.md**      | Application hooks (can interact with Convex)            | Creating shared hooks      |
| **EXPO_PROVIDERS.md**  | React Context providers (Convex, i18n, analytics)       | Understanding app context  |
| **EXPO_UI.md**         | Isolated UI system (reusable components, hooks, utils)  | Working with UI components |
| **lib/LIB_CONVEX.md**  | Convex client integration (useQuery, useMutation, etc.) | Fetching data from Convex  |
| **lib/LIB_POSTHOG.md** | PostHog analytics integration (React Native)            | Adding event tracking      |
| **lib/LIB_IMAGE.md**   | Image processing utilities                              | Working with images        |

---

## Critical Rules (READ FIRST)

### Environment Variables

```typescript
// ✅ ALWAYS use centralized env
import { env } from "env"
const apiKey = env.NEXT_PUBLIC_API_KEY

// ❌ NEVER access process.env directly
const apiKey = process.env.NEXT_PUBLIC_API_KEY // WRONG!
```

### Convex: Import Procedures Correctly

```typescript
// ✅ ALWAYS import from procedures.ts
import { authQuery, publicQuery, serverQuery } from "../../procedures"
import { internal } from "../../_generated/api"

// ❌ NEVER import from generated files
import { query } from "../../_generated/server" // WRONG!
```

### Convex: Router Naming Convention

```typescript
// File: convex/router/users/getOne.ts (operation-based, camelCase)
export const anon = publicQuery({ ... })      // Public access
export const authed = authQuery({ ... })      // Authenticated users
export const admin = adminQuery({ ... })      // Admin only
export const server = serverQuery({ ... })    // Next.js backend only
export const _internal = internalQuery({ ... }) // Convex internal
```

### Next.js: Server vs Client Components

**Note**: React Native doesn't have server components - all components are client-side.

```typescript
// ✅ React Native Component - uses client-side hooks
import { api, useQuery } from '@/lib/convex/client'

export function Component() {
  const { data } = useQuery(api.router.users.getOne.authed)
  return <View><Text>{data?.name}</Text></View>
}
```

### Next.js: UI Isolation

```typescript
// ✅ CORRECT - UI folder is isolated
// expo/ui/components/button.tsx
import { cn } from '@ui/utils'

// ❌ WRONG - NO Convex or business logic in ui/
import { useQuery } from 'convex/react' // DON'T DO THIS!
```

### Server Actions

**Note**: Expo doesn't use server actions. Use Convex mutations/actions directly.

```typescript
// ✅ Call Convex mutations directly
import { api, useMutation } from '@/lib/convex/client'

const updateUser = useMutation(api.router.users.update.authed)
await updateUser({ name: "New Name" })
```

### LLM Operations (Convex Only)

```typescript
// ✅ ALWAYS use default agent
import { defaultAgent } from "../../llm/agents/default"
const result = await defaultAgent.generateText({ ... })

// ❌ NEVER import AI SDK directly
import { generateText } from "ai" // WRONG!
```

---

## Project Structure

### Convex Backend (`convex/`)

```
convex/
├── procedures.ts           # Custom procedures (⚠️ MOST IMPORTANT)
├── schema.ts              # Database schema
├── migrations.ts          # Schema migrations
├── http.ts                # HTTP routes/webhooks
├── cron.ts                # Scheduled jobs
├── env.ts                 # Environment variables
├── router/                # API endpoints (⚠️ MOST IMPORTANT FOLDER)
│   ├── users/            # User-related endpoints
│   │   ├── getOne.ts    # Operation-based naming
│   │   └── update.ts
│   ├── stripe/           # Payment processing
│   └── storage/images/   # Image handling
├── functions/             # Reusable database logic
│   ├── users/
│   ├── subscriptions/
│   └── images/
├── lib/                   # Third-party integrations
│   ├── stripe/
│   ├── image/
│   └── nanoid/
├── llm/                   # AI/LLM integration
│   ├── agents/           # AI agents (use defaultAgent)
│   ├── config/           # Model configurations
│   ├── rag/              # RAG implementation
│   ├── tools/            # AI tools
│   └── triggers/         # AI triggers
└── schema/                # Table definitions
    ├── users.ts
    ├── images.ts
    └── subscriptions.ts
```

### Expo/React Native Application (`expo/`) (formerly src/)

```
expo/
├── middleware.ts         # Auth middleware
├── global/              # Global constants (import from "global")
├── hooks/               # Shared hooks (CAN interact with Convex)
│   ├── use-debounce.ts
│   └── use-resolve-on-change.ts
├── providers/           # Context providers
│   ├── index.tsx       # Main providers wrapper
│   ├── convex-client.tsx
│   ├── i18n.tsx        # react-i18next provider
│   ├── posthog.tsx
│   ├── motion.tsx
│   └── async/          # Async providers (tracking, side effects)
├── lib/                 # Library integrations
│   ├── convex/         # Convex client helpers
│   ├── posthog/        # Analytics (React Native)
│   ├── image/          # Image processing
│   └── s3/             # S3 utilities
├── modules/             # ⚠️ Feature modules (complex, reusable features)
└── ui/                  # ⚠️ Isolated UI (NO Convex!)
    ├── components/     # Reusable UI components
    │   ├── button.tsx
    │   ├── collapsible.tsx
    │   ├── external-link.tsx
    │   ├── themed-text.tsx
    │   ├── themed-view.tsx
    │   └── icons/
    ├── hooks/          # UI-specific hooks
    └── utils/          # UI utilities
```

### App Router (`app/`)

Expo Router - file-based routing for React Native:

```
app/
├── _layout.tsx          # Root layout (providers, fonts)
├── modal.tsx            # Example modal screen
└── (tabs)/             # Tab navigation group
    ├── _layout.tsx     # Tab layout (bottom tabs)
    ├── index.tsx       # Home tab
    └── explore.tsx     # Explore tab
```

**Routing patterns**:
- `_layout.tsx` - Layout for nested routes
- `(folder)` - Route group (doesn't affect URL)
- `[param]` - Dynamic route parameter
- All screens are client-side (React Native)

### Shared Utilities (`utils/`)

```
utils/
├── routes.ts              # Route utilities
├── path.ts                # Path utilities
└── convex-allowed/        # ⚠️ BRIDGE between Expo & Convex
    ├── dimensions.ts     # Pure utilities compatible with both
    ├── queue.ts
    ├── retry.ts
    ├── typescript.helpers.ts
    └── lib/              # Re-exported libraries for Convex
        └── images.ts     # From expo/lib/image
```

**⚠️ CRITICAL**: `utils/convex-allowed/` must be compatible with Convex's edge runtime:
- ✅ Pure TypeScript utilities
- ✅ Type definitions
- ❌ NO browser APIs (window, document)
- ❌ NO Node.js APIs (unless in "use node" actions)
- ❌ NO heavy dependencies

### Translations (`translations/`)

```
translations/
├── index.ts              # Main exports
├── translations.ts       # i18n initialization (synchronous, bundled)
├── types.d.ts            # TypeScript types
├── en/                   # English
│   ├── common.json
│   └── home.json
└── fr/                   # French
    ├── common.json
    └── home.json
```

```ts
import { useTranslations } from "translations";
const t = useTranslations("Home");
// Translations are bundled and initialized synchronously - instant startup
```

See [.readme/TRANSLATIONS.md](.readme/TRANSLATIONS.md) for more information

---

## Common Patterns

### Convex: Creating a Route

1. Choose folder: `convex/router/{domain}/{operation}.ts` (camelCase)
2. Import procedures: `import { authQuery } from "../../procedures"`
3. Export with correct name: `export const authed = authQuery({ ... })`
4. Call from frontend: `useQuery(api.router.{domain}.{operation}.authed)`

### Convex: Procedure Selection

```
Internal Convex call (cron, other mutations)?
  → internalQuery/internalMutation/internalAction (_internal export)
  
External call from browser?
  → No auth: publicQuery/publicMutation (anon export)
  → User auth: authQuery/authMutation (authed export)
  → Admin: adminQuery/adminMutation (admin export)
  
External call from Expo/React Native?
  → Use authed/anon exports (no server export needed)
```

### Expo: Creating a Screen

1. Create file in `app/` folder (e.g., `app/settings.tsx`)
2. Export default component
3. Use Expo Router conventions (`_layout.tsx` for layouts, `(group)` for groups)
4. All components are client-side

### Expo: Fetching Data

```typescript
// Client (realtime) - standard for React Native
import { api, useQuery, useMutation } from '@/lib/convex/client'
const { data } = useQuery(api.router.users.getOne.authed)
const updateUser = useMutation(api.router.users.update.authed)
```

### Analytics

```typescript
// PostHog React Native tracking
import { posthog } from '@/lib/posthog'

posthog?.capture('event_name', {
  property1: 'value1',
  property2: 'value2',
})
```

### Translations

```typescript
// React Native i18n
import { useTranslations } from "translations"
const t = useTranslations("Home")

// Use in component
<Text>{t("title")}</Text>

// Note: Translations are bundled and initialized synchronously
// No async loading needed - instant startup
```

---

## Import Aliases

| Alias                 | Points To                   | Use Case                    |
| --------------------- | --------------------------- | --------------------------- |
| **Convex**            |                             |                             |
| `../../procedures`    | `convex/procedures.ts`      | Procedures (⚠️ ALWAYS)       |
| `../../functions/*`   | `convex/functions/*`        | Reusable functions          |
| `@/lib/*`             | `convex/lib/*`              | Convex lib folder           |
| **Expo**              |                             |                             |
| `@ui/*`               | `expo/ui/components/*`      | UI components               |
| `@ui/hooks/*`         | `expo/ui/hooks/*`           | UI-specific hooks           |
| `@ui/utils`           | `expo/ui/utils`             | UI utilities                |
| `@/`                  | `expo/`                     | Any expo folder import      |
| `@/lib/convex/client` | `expo/lib/convex/client.ts` | Frontend Convex hooks       |
| **Shared**            |                             |                             |
| `@utils/*`            | `utils/*`                   | Shared utilities            |
| `@shared/utils`       | `utils/convex-allowed/`     | Cross-environment utilities |
| `global`              | `expo/global`               | Global constants            |
| `translations`        | `translations/`             | i18n                        |
| `assets/*`            | `assets/*`                  | Static files                |
| `env`                 | `env.js`                    | Type-safe env vars          |

---

## Quick Navigation by Task

### Backend (Convex)

- **Understand procedures** → `convex/CONVEX_PROCEDURES.md` (⚠️ READ FIRST)
- **Create API routes** → `convex/CONVEX_ROUTER.md`
- **Define database tables** → `convex/CONVEX_SCHEMA.md`
- **Create shared logic** → `convex/CONVEX_FUNCTIONS.md`
- **Add external services** → `convex/CONVEX_LIB.md`
- **Add AI features** → `convex/CONVEX_LLM.md`
- **Add webhooks** → `convex/CONVEX_HTTP.md`
- **Schedule tasks** → `convex/CONVEX_CRON.md`
- **Change schema** → `convex/CONVEX_MIGRATIONS.md`
- **Use env vars** → `convex/CONVEX_ENV.md`

### Frontend (Expo/React Native)

- **Create a screen** → `expo/EXPO_APP.md` (needs updating for Expo Router)
- **Use Convex data** → `expo/lib/LIB_CONVEX.md`
- **Add UI component** → `expo/EXPO_UI.md`
- **Create shared hook** → `expo/EXPO_HOOKS.md`
- **Understand providers** → `expo/EXPO_PROVIDERS.md`
- **Track analytics** → `expo/lib/LIB_POSTHOG.md`
- **Process images** → `expo/lib/LIB_IMAGE.md`

---

## Key Architectural Principles

### Separation of Concerns

1. **Business Logic** → Convex functions/router
2. **UI Components** → expo/ui (isolated, NO Convex)
3. **Screen-Specific Code** → app/[route]/_components (if needed)
4. **Feature Modules** → expo/modules (complex features)
5. **Shared Code** → utils/convex-allowed (cross-environment)

### Data Flow

```
User Interaction (React Native)
    ↓
Client Component (useQuery/useMutation)
    ↓
Convex Router (authQuery/authMutation)
    ↓
Convex Functions (database logic)
    ↓
Database (Convex schema)
```

### Component Strategy

- **Default**: Server components (cheaper, better performance)
- **Client**: When real-time updates needed (most of the time)
- **PreloadQuery**: Best of both (server render + client hydration)

### Code Organization

- **Domain-based folders**: Group by business domain (users, subscriptions, images)
- **One function per file**: Server actions export single function
- **Operation-based naming**: Convex router files named by operation (getOne, update, delete)
- **Explicit exports**: Named exports like `authed`, `server`, not generic names

---

## Protected Routes

Routes under `/app/*` require authentication. Middleware redirects unauthenticated users to `/auth` with redirect parameter.

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Start Next.js dev server
pnpm dev

# Start with local tunnel (for webhooks)
pnpm dev:tunnel

# Start Convex dev environment
pnpm convex:dev

# Build for production
pnpm build

# Start production server
pnpm start
```

---

## Remember

### Convex

1. **Always** import procedures from `procedures.ts`, never from `_generated/server`
2. **Router naming**: operation-based files (getOne.ts), procedure-based exports (anon, authed, server)
3. **Server functions** automatically include `_serverKey` - don't pass manually
4. **LLM operations** always use `defaultAgent`, never direct AI SDK imports
5. **camelCase** for everything in Convex

### Next.js

1. **kebab-case** for files, **CamelCase** inside, **_prefix** for private
2. **Server components** by default, client only for real-time
3. **UI folder** is completely isolated from Convex and business logic
4. **Server actions** one explicit function per file with "use server"
5. **Metadata** on every page (use translations for i18n)
6. **Use aliases** - @ui/*, @/, global, translations

### General

1. **Environment variables** always from `env.js`, never `process.env`
2. **Shared code** in `utils/convex-allowed/` must be edge-compatible
3. **Sub-components** use dot notation (timeline.tsx, timeline.bar.tsx)
4. **Domain organization** group related code by business logic
5. **Type safety** everywhere - Convex schema, env vars, translations

---

## Troubleshooting

### Common Issues

1. **Import errors**: Check aliases and use correct ones
2. **Convex connection issues**: Check `convex.json` and authentication
3. **Environment variables not working**: Import from `env.js`, not `process.env`
4. **Type errors**: Run `pnpm convex:dev` to regenerate Convex types
5. **UI importing Convex**: Check `src/ui/` - should be isolated
6. **Wrong procedure**: Check `CONVEX_PROCEDURES.md` for correct procedure type

---

## Additional Resources

- **Convex Docs**: https://docs.convex.dev
- **Next.js Docs**: https://nextjs.org/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com

---

## Start Here

1. Read `ROOT.md` for complete project overview
2. Read `convex/CONVEX_PROCEDURES.md` before writing backend code
3. Read `expo/EXPO_APP.md` before creating screens
4. Refer to this summary for quick reminders
5. Dive into specific documentation files as needed
