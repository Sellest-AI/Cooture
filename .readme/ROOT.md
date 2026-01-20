# Boilerplate Project Documentation

## Overview

This is a **Convex + React Native (Expo)** full-stack application boilerplate designed for rapid development of modern mobile and web applications with real-time backend capabilities.

### Tech Stack

- **Frontend Framework**: Expo (React Native) with Expo Router
- **Backend/Database**: Convex (real-time database & serverless functions)
- **UI Components**: NativeWind (Tailwind for React Native)
- **Styling**: Tailwind CSS 3+ (via NativeWind)
- **Icons**: Expo Symbols & Lucide React Native
- **State Management**: Jotai
- **Animations**: React Native Reanimated
- **Internationalization**: react-i18next
- **Package Manager**: PNPM (or npm/yarn)
- **Code Quality**: ESLint with Expo configuration
- **Platforms**: iOS, Android, Web

### Quick Start

```bash
# Install dependencies
pnpm install

# Start Convex development (REQUIRED - run first)
pnpm convex:dev

# In a separate terminal, start Expo
pnpm start        # Choose platform (iOS/Android/Web)
pnpm android      # Start on Android
pnpm ios          # Start on iOS
pnpm web          # Start on Web

# AI Agent Playground
pnpm playground   # Open @convex-dev/agent-playground
```

---

## Project Architecture

### Root-Level Files

#### Environment Variables (`env.js`)

**⚠️ CRITICAL**: Always use the centralized environment configuration.

```typescript
// ✅ CORRECT
import { env } from "env";

const apiKey = env.NEXT_PUBLIC_API_KEY;
```

```typescript
// ❌ WRONG - Never do this
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
```

The `env.js` file uses `@t3-oss/env-nextjs` for type-safe environment variable validation and provides a single source of truth for all environment configuration.

#### Configuration Files

- `app.json` - Expo application configuration
- `expo-env.d.ts` - Expo TypeScript definitions
- `convex.json` - Convex project configuration (defines external Node.js packages for deployment)
- `tsconfig.json` - TypeScript configuration for Expo
- `eslint.config.mjs` - ESLint configuration

---

## Directory Structure

### `.readme/` - Documentation

Contains all documentation files for this project, including:
- Main documentation files (like this ROOT.md)
- `LLM/` folder with token-optimized versions for AI context

### `convex/` - Backend & Database Layer

The Convex environment handles all backend logic, database operations, and API endpoints.

**Key Concepts**:
- **Queries**: Read-only database operations (reactive, automatically update UI)
- **Mutations**: Write operations that modify database state
- **Actions**: Server-side functions (can call external APIs, use Node.js libraries)
- **HTTP Routes**: REST API endpoints
- **Scheduled Functions**: Cron jobs for automated tasks

**Structure**:
```
convex/
├── procedures.ts           # Custom procedures (authQuery, publicQuery, etc.)
├── schema.ts              # Database schema definitions
├── migrations.ts          # Schema migrations
├── http.ts                # HTTP endpoint definitions
├── cron.ts                # Scheduled functions
├── router/                # API routes (organized by domain)
│   ├── users/            # User-related endpoints
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
└── llm/                   # AI/LLM integration
    ├── agents/
    ├── config/
    ├── rag/
    └── tools/
```

**File Naming**: camelCase for everything in Convex (files, functions, variables)

**Critical Import Pattern**:
```typescript
// ✅ ALWAYS import from procedures.ts
import { authQuery, publicQuery, serverQuery } from "../../procedures"

// ❌ NEVER import from generated files
import { query } from "../../_generated/server"
```

**Router Naming Convention**:
```typescript
// File: router/users/getOne.ts (operation-based naming)
export const anon = publicQuery({ ... })      // Public access
export const authed = authQuery({ ... })      // Authenticated users
export const server = serverQuery({ ... })    // Next.js backend only
export const _internal = internalQuery({ ... }) // Convex internal
```

📖 **See detailed documentation**: [convex/ROOT.md](./convex/ROOT.md)
- [CONVEX_PROCEDURES.md](./convex/CONVEX_PROCEDURES.md) - Custom procedures (READ FIRST)
- [CONVEX_ROUTER.md](./convex/CONVEX_ROUTER.md) - API routes & naming
- [CONVEX_SCHEMA.md](./convex/CONVEX_SCHEMA.md) - Database schema
- [CONVEX_FUNCTIONS.md](./convex/CONVEX_FUNCTIONS.md) - Reusable logic
- [CONVEX_LIB.md](./convex/CONVEX_LIB.md) - Third-party integrations
- [CONVEX_LLM.md](./convex/CONVEX_LLM.md) - AI/LLM features
- [LLM_SUMMARY.md](./convex/LLM_SUMMARY.md) - Quick reference guide

### `expo/` - React Native Application

The main application source code containing all frontend logic and components for iOS, Android, and Web platforms.

**Structure**:
```
expo/
├── middleware.ts         # Auth middleware
├── global/              # Global constants (import from "global")
├── hooks/               # Shared application hooks (can interact with Convex)
├── providers/           # React Context providers (Convex, i18n, analytics)
├── lib/                 # Library integrations (Convex client, PostHog, image processing)
├── modules/             # Feature modules (complex, reusable features)
└── ui/                  # Isolated UI system (NO Convex interaction)
    ├── components/      # Reusable UI components
    ├── hooks/          # UI-specific hooks
    └── utils/          # UI utilities
```

**File Naming**: kebab-case for files, CamelCase inside files, `_functionName` for private functions

**Key Principles**:
- **modules/**: Feature-based organization for complex features
- **ui/**: Completely isolated from business logic and Convex
- **hooks/**: Can interact with Convex (unlike ui/hooks)
- **providers/**: App-wide context (Convex, i18n, analytics)

📖 **See detailed documentation**: [expo/ROOT.md](./expo/ROOT.md) (formerly src/)
- [expo/EXPO_HOOKS.md](./expo/EXPO_HOOKS.md) - Application hooks
- [expo/EXPO_PROVIDERS.md](./expo/EXPO_PROVIDERS.md) - Context providers
- [expo/EXPO_UI.md](./expo/EXPO_UI.md) - UI system
- [expo/lib/](./expo/lib/) - Library integrations (Convex, PostHog, Image)

### `app/` - Expo Router (File-based Routing)

React Native navigation using Expo Router (file-based routing system).

**Structure**:
```
app/
├── _layout.tsx          # Root layout
├── modal.tsx            # Example modal
└── (tabs)/             # Tab navigation
    ├── _layout.tsx     # Tab layout
    ├── index.tsx       # Home tab
    └── explore.tsx     # Explore tab
```

**File Naming**: kebab-case for route files

**Key Principles**:
- File-based routing (similar to Next.js App Router)
- `_layout.tsx` for layouts
- `(folder)` for route groups
- All components are client-side (React Native)

### `translations/` - Internationalization

Handles all translation files and i18n utilities using react-i18next.

**Import Patterns**:
```typescript
// Client components (React Native)
import { useTranslations } from "translations"
const t = useTranslations("Home")

return <Text>{t("title")}</Text>
```

**Structure**:
- Synchronous initialization (bundled translations)
- Namespace-based organization (Home, Common, etc.)
- Full TypeScript support
- Provider: `expo/providers/i18n.tsx`

Look at TRANSLATIONS.md for more information

### `utils/` - Shared Utilities

**Alias**: `@utils/*`

Contains non-UI utilities and helpers. This folder has a special subfolder structure for cross-environment compatibility.

#### `utils/convex-allowed/` - Bridge Between Next.js & Convex

**⚠️ CRITICAL**: This folder is a bridge allowing code sharing between Next.js and Convex environments.

**Alias**: `@shared/utils`

**Important Constraints**:
- ✅ Must be compatible with Convex's edge runtime
- ✅ No browser-specific APIs (window, document, etc.)
- ✅ No Node.js-specific APIs (unless in "use node" actions)
- ✅ Pure TypeScript utilities, type definitions, and helpers
- ❌ Do NOT import heavy dependencies
- ❌ Do NOT use file system operations (except in "use node" actions)

**Example File**:
```typescript
// utils/convex-allowed/typescript.helpers.ts
/** use this like that : array.filter(notEmpty) */
export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}
```

#### `utils/convex-allowed/lib/` - Re-exported Libraries

This subfolder allows specific library exports to be shared with Convex. Libraries from expo/lib.

**⚠️ WARNING**: 
- Only export packages compatible with Convex's runtime
- Test thoroughly in both environments
- Prefer lightweight, pure functions

**Example**:
```typescript
// utils/convex-allowed/lib/images.ts
// Re-exports image utilities from expo/lib/image for use in Convex
// Use relative path ONLY, NO ALIAS
export * from '../../../expo/lib/image/server/utils';
```

This allows image processing utilities to be used in both Convex actions and Expo without code duplication.

### `assets/` - Static Assets

Contains static files for the React Native application:
- Images
- Videos
- Fonts
- App icons

**Usage**:
```typescript
// Reference in Expo
import { Image } from 'expo-image';
<Image source={require('assets/images/logo.png')} style={{ width: 200, height: 100 }} />
```

---

## Key Features

### Authentication

Built with `@convex-dev/auth` providing:
- Email/password authentication
- OAuth providers (GitHub, Google, etc.)
- Session management
- Protected routes via middleware

### Stripe Integration

Full billing and subscription management:
- Checkout sessions
- Customer portal
- Webhook handling via local tunnel
- Subscription status tracking
- Invoice management

### Image Processing

Advanced image handling:
- Client-side compression
- HEIC conversion (if needed for mobile)
- Sharp for server-side processing
- Optimized storage in Convex
- expo-image for optimized display

### AI/LLM Integration

Built-in support for AI agents:
- RAG (Retrieval-Augmented Generation)
- Custom agents and tools
- Replicate integration
- Agent playground for testing

### Analytics

PostHog integration for:
- User tracking (mobile & web)
- Feature flags
- A/B testing
- Session replay (web)

---

## Development Workflow

### Running the Application

1. **Start Convex Development** (REQUIRED - run first):
   ```bash
   pnpm convex:dev
   ```
   Starts Convex development environment with hot reloading

2. **Standard Development** (in separate terminal):
   ```bash
   pnpm start        # Interactive menu to choose platform
   pnpm android      # Start on Android emulator/device
   pnpm ios          # Start on iOS simulator/device (Mac only)
   pnpm web          # Start web version
   ```

3. **AI Agent Playground**:
   ```bash
   pnpm playground
   ```
   Opens the @convex-dev/agent-playground for testing AI agents

### Environment Setup

1. Copy `.env.example` to `.env.local`
2. Configure environment variables in `env.js`
3. Update Convex configuration in `convex.json`

### Code Organization Best Practices

1. **Keep UI components in `expo/ui/components/`**
2. **Keep business logic in `convex/functions/`**
3. **Keep shared utilities in `utils/convex-allowed/`**
4. **Keep feature modules in `expo/modules/`**
5. **Use import aliases**:
   - `@ui/*` for `expo/ui/components/*`
   - `@/` for `expo/`
   - `@utils/` for `utils/`
   - `@shared/utils` for `utils/convex-allowed/`
   - `global` for global constants
   - `translations` for i18n
   - `assets/*` for static files

### Type Safety

This boilerplate prioritizes type safety:
- Fully typed Convex schema
- Type-safe environment variables
- Typed i18n translations
- Strict TypeScript configuration

---

## Common Patterns

### Fetching Data in React Native

```typescript
"use client"; // Not needed in React Native, but shown for clarity
import { api, useQuery, useMutation } from "@/lib/convex/client";

export function UserProfile() {
  // Query (reactive, auto-updates)
  const user = useQuery(api.router.users.getCurrentUser.authed);
  
  // Mutation
  const updateUser = useMutation(api.router.users.updateProfile.authed);

  const handleUpdate = async () => {
    await updateUser({ name: "New Name" });
  };

  return (
    <View>
      <Text>{user?.name}</Text>
      <Button onPress={handleUpdate} title="Update" />
    </View>
  );
}
```

### Creating API Endpoints

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/api/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    // Handle webhook
    return new Response("OK", { status: 200 });
  }),
});

export default http;
```

### Scheduled Functions

```typescript
// convex/cron.ts
import { cronJobs } from "convex/server";

const crons = cronJobs();

crons.interval(
  "cleanup-old-data",
  { hours: 24 },
  api.router.admin.cleanupOldData
);

export default crons;
```

---

## Troubleshooting

### Common Issues

1. **Import errors**: Ensure you're using the correct aliases
2. **Convex connection issues**: Check `convex.json` and authentication
3. **Environment variables not working**: Always import from `env.js`, not `process.env`
4. **Type errors**: Run `pnpm convex:dev` to regenerate Convex types

### Getting Help

- Check related documentation files (CONVEX_*.md, expo/*.md)
- Review Convex documentation: https://docs.convex.dev
- Review Expo documentation: https://docs.expo.dev
- Review Expo Router documentation: https://docs.expo.dev/router/introduction/

---

## Summary

This boilerplate provides a production-ready foundation for building modern mobile and web applications with:
- ✅ Real-time database and serverless backend (Convex)
- ✅ Cross-platform framework (Expo - iOS, Android, Web)
- ✅ Type-safe environment with full TypeScript
- ✅ Authentication and authorization
- ✅ Payment processing (Stripe)
- ✅ Internationalization
- ✅ AI/LLM capabilities
- ✅ Analytics and monitoring
- ✅ Developer experience optimizations

Start building by exploring the `src/app/` directory for frontend components and `convex/router/` for backend endpoints.
