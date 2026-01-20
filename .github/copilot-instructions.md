# Copilot Instructions for Expo + Convex Boilerplate

## Project Overview

This is a full-stack TypeScript application combining **Expo (React Native)** (frontend) with **Convex** (serverless backend/database). The project provides real-time database, authentication, payments (Stripe), AI/LLM integration, and analytics (PostHog) for iOS, Android, and Web platforms.

**Tech Stack**: Expo with Expo Router, React 19, React Native, Convex (database/backend), NativeWind (Tailwind for RN), Jotai (state), react-i18next (i18n), PostHog (analytics), PNPM (package manager)

**Repository Size**: Medium (~50+ files in expo/, ~50+ in convex/, ~10+ in app/)

## 🚨 CRITICAL: Documentation First Approach

**ALWAYS start by consulting the comprehensive documentation in `.readme/` before making changes:**

1. **First**: Read `.readme/LLM_SUMMARY.md` - Complete project reference covering all critical rules and patterns
2. **For backend work**: Read `.readme/convex/ROOT.md` then specific CONVEX_*.md files
3. **For frontend work**: Read `.readme/expo/ROOT.md` then specific EXPO_*.md files
4. **For deep dives**: Consult individual documentation files as referenced in ROOT.md files

**The documentation is the source of truth.** It contains critical patterns, naming conventions, and architectural rules that MUST be followed. DO NOT skip reading relevant documentation before implementing features.

## Build & Development Commands

**Runtime Requirements**:
- Node.js 18+ (project uses Node.js 25.0.7 in types)
- PNPM (or npm/yarn - project uses PNPM)

**Initial Setup** (run in order):
```bash
pnpm install              # ALWAYS run first - installs all dependencies
pnpm convex:dev           # Start Convex backend (required for development)
# In separate terminal:
pnpm start                # Start Expo (requires Convex to be running)
```

**Available Commands**:
- `pnpm start` - Start Expo development server (interactive menu)
- `pnpm android` - Start on Android emulator/device
- `pnpm ios` - Start on iOS simulator/device (Mac only)
- `pnpm web` - Start web version
- `pnpm convex:dev` - Start Convex development environment (MUST run before Expo)
- `pnpm playground` - Open AI agent playground (@convex-dev/agent-playground)
- `pnpm lint` - Run ESLint

**Critical Rules**:
- ALWAYS run `pnpm convex:dev` BEFORE `pnpm start` - Expo requires Convex connection
- ALWAYS run `pnpm install` after pulling changes - dependencies change frequently
- Environment variables must be in `.env.local` (see env.js for required vars)
- Convex generates types automatically - DO NOT manually edit `convex/_generated/`

**Common Build Issues**:
- "Convex not found" error: Ensure `pnpm convex:dev` is running in separate terminal
- Type errors after schema changes: Restart Convex dev server to regenerate types
- Import errors: Check path aliases in tsconfig.json and use correct ones

## Critical Architectural Rules

### 🔴 NEVER VIOLATE THESE RULES:

**Environment Variables**:
```typescript
// ✅ CORRECT - ALWAYS
import { env } from "env"
const key = env.NEXT_PUBLIC_API_KEY

// ❌ WRONG - NEVER DO THIS
const key = process.env.NEXT_PUBLIC_API_KEY
```

**Convex Procedures** (`.readme/convex/CONVEX_PROCEDURES.md`):
```typescript
// ✅ CORRECT - Import from procedures.ts
import { authQuery, publicQuery, serverQuery } from "../../procedures"

// ❌ WRONG - Never import from generated files
import { query } from "../../_generated/server"
```

**Convex Naming** (`.readme/convex/CONVEX_ROUTER.md`):
- Files: camelCase (getOne.ts, updateProfile.ts)
- Exports: anon, authed, admin, server, _internal (NOT custom names)
- Folders: camelCase (users/, storageImages/)

**Expo Naming** (`.readme/expo/ROOT.md`):
- Files: kebab-case (user-profile.tsx, use-debounce.ts)
- Code: CamelCase (function UserProfile, const userName)
- Private: _functionName (function _parseData)

**UI Isolation** (`.readme/expo/EXPO_UI.md`):
```typescript
// ❌ NEVER import Convex or business logic in expo/ui/ folder
// expo/ui/ is completely isolated - only pure UI components
```

**React Native Components**:
- All components are client-side (no "use server" or server components)
- Use `useQuery` and `useMutation` from `@/lib/convex/client` for all data fetching

## Project Structure

**Root Files**:
- `env.js` - Type-safe environment configuration (⚠️ ONLY source for env vars)
- `app.json` - Expo application configuration
- `expo-env.d.ts` - Expo TypeScript definitions
- `tsconfig.json` - TypeScript config (contains path aliases)
- `convex.json` - Convex project configuration
- `eslint.config.js` - ESLint configuration
- `package.json` - Dependencies and scripts

**Key Directories**:

1. **`.readme/`** - 🔴 COMPREHENSIVE DOCUMENTATION (READ FIRST)
   - `LLM_SUMMARY.md` - Complete project quick reference
   - `ROOT.md` - Main overview
   - `convex/` - All Convex backend docs (CONVEX_*.md files)
   - `expo/` - All Expo/React Native frontend docs (EXPO_*.md files)

2. **`convex/`** - Backend (Convex serverless functions)
   - `procedures.ts` - ⚠️ Custom procedures (ALWAYS import from here)
   - `router/` - API endpoints organized by domain
   - `functions/` - Reusable database logic
   - `lib/` - Third-party integrations (Stripe, image processing)
   - `llm/` - AI/LLM integration
   - `schema.ts` - Database schema
   - See `.readme/convex/ROOT.md` for complete structure

3. **`expo/`** - Frontend (React Native application)
   - `ui/` - ⚠️ Isolated UI system (NO Convex interaction allowed)
   - `lib/convex/` - Convex client helpers
   - `modules/` - Feature modules
   - `providers/` - React Context providers
   - `hooks/` - Shared hooks
   - See `.readme/expo/ROOT.md` for complete structure

4. **`app/`** - Expo Router (file-based routing)
   - `_layout.tsx` - Root layout
   - `(tabs)/` - Tab navigation
   - See Expo Router documentation for routing patterns

5. **`utils/convex-allowed/`** - Shared code between Expo and Convex
   - ⚠️ MUST be edge-compatible (no browser/Node.js specific APIs)
   - Alias: `@shared/utils`

6. **`translations/`** - i18n using react-i18next
   - `en/`, `fr/` - Language files
   - Import: `import from "translations"`

## Path Aliases (tsconfig.json)

```typescript
@ui/*               → expo/ui/components/*
@ui/hooks/*         → expo/ui/hooks/*
@ui/utils           → expo/ui/utils
@/                  → expo/
@utils/*            → utils/*
@shared/utils       → utils/convex-allowed/*
global              → expo/global
translations        → translations/
assets/*            → assets/*
env                 → env.js
```

**In Convex**:
```typescript
../../procedures   → convex/procedures.ts (⚠️ ALWAYS use)
../../functions/*  → convex/functions/*
@/lib/*            → convex/lib/*
```

## Validation & Testing

**No automated tests currently** - Validate changes by:
1. Running `pnpm lint` - ESLint checks
2. Manual testing on iOS/Android/Web
3. Check Convex dashboard for backend errors

**Pre-commit Validation** (recommended):
1. `pnpm lint` - Check for linting errors
2. Ensure both Convex and Expo dev servers start without errors

**No CI/CD workflows** currently configured - all validation is local.

## Common Patterns & Examples

**Convex Router Creation** (`.readme/convex/CONVEX_ROUTER.md`):
```typescript
// convex/router/users/getOne.ts
import { authQuery } from "../../procedures"
import { v } from "convex/values"

export const authed = authQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId)
  },
})
```

**React Native Screen Creation**:
```typescript
// app/profile.tsx
import { api, useQuery } from "@/lib/convex/client"
import { View, Text } from "react-native"

export default function ProfileScreen() {
  const user = useQuery(api.router.users.getOne.authed)
  return (
    <View>
      <Text>{user?.name}</Text>
    </View>
  )
}
```

## Key Files to Review

**Configuration**:
- `env.js` - Environment variable definitions and validation
- `tsconfig.json` - TypeScript configuration and path aliases
- `convex/procedures.ts` - Custom Convex procedures (critical)
- `expo/middleware.ts` - Authentication middleware

**Integration Points**:
- `expo/lib/convex/client.ts` - Client-side Convex hooks
- `expo/providers/index.tsx` - React context providers
- `convex/auth.config.ts` - Authentication configuration

## Instructions for Copilot

1. **ALWAYS read `.readme/LLM_SUMMARY.md` first** if you haven't already - it contains ALL critical rules
2. **Consult specific documentation** before implementing:
   - Backend work → `.readme/convex/` docs
   - Frontend work → `.readme/expo/` docs
   - Look for ROOT.md files first, then specific topic files
3. **Follow naming conventions strictly**:
   - Convex: camelCase everywhere
   - Expo: kebab-case files, CamelCase code
4. **Never violate isolation rules**:
   - expo/ui/ must NOT import Convex
   - Use correct import aliases
   - Import env from env.js only
5. **Check path aliases** in tsconfig.json - use them instead of relative paths
6. **All components are client-side in React Native** - no server components or "use server"
7. **Trust these instructions** - only search codebase if information is incomplete or unclear
8. **When adding features**:
   - Check if similar feature exists first (search codebase)
   - Follow existing patterns in same domain folder
   - Maintain consistency with documented architecture
9. **For Convex changes**: Always import procedures from `procedures.ts`, never `_generated/server`
10. **For schema changes**: Document in migrations.ts, restart convex:dev to regenerate types

## 🔴 CRITICAL: Documentation Updates

**When making architectural or structural changes**, you MUST:

1. **WARN the user** that architectural changes were made
2. **ASK the user** if they want you to update the related documentation
3. **Specify which documentation files** need updating:
   - Specific documentation file (e.g., `.readme/convex/CONVEX_ROUTER.md`)
   - Related ROOT.md file (e.g., `.readme/convex/ROOT.md` or `.readme/expo/ROOT.md`)
   - Related LLM_SUMMARY.md file (e.g., `.readme/convex/LLM_SUMMARY.md` or `.readme/expo/LLM_SUMMARY.md`)
   - Main project summary (`.readme/LLM_SUMMARY.md` and `.readme/ROOT.md`)

**Architectural changes include**:
- New folder structure or organization patterns
- New naming conventions
- New import patterns or aliases
- New architectural layers or separation of concerns
- Changes to build/development workflow
- New critical rules or constraints
- Changes to how components interact (client/server, Convex/Next.js, etc.)

**Example warning**:
```
⚠️ ARCHITECTURAL CHANGE DETECTED:
- Created new folder pattern for modules in src/app/
- Added new import pattern for sub-components

Documentation that should be updated:
- .readme/expo/EXPO_APP.md (folder structure section)
- .readme/expo/ROOT.md (structure summary)
- .readme/expo/LLM_SUMMARY.md (project structure and common patterns)

Would you like me to update these documentation files?
```

Note: This shouldn't be triggered for minor code changes, folders, or feature additions that don't impact overall architecture.

**If documentation seems incomplete**: Search codebase, but prioritize documented patterns over exploratory findings. The `.readme/` documentation is authoritative.
