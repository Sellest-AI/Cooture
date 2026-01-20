# expo/ Directory

Source folder for Expo/React Native application code (iOS, Android, Web).

## Naming Convention

**Files**: kebab-case for components, hooks, and function files  
**Inside files**: CamelCase for functions, variables, classes  
**Private functions**: Prefix with underscore (`_functionName`) for internal-only functions

## Structure

### middleware.ts

Authentication middleware for protected routes.

### global/

Global constants and variables, imported via `import from "global"`

### [hooks/](./EXPO_HOOKS.md)

Shared application hooks (not UI-specific). Can interact with Convex. Currently includes `useDebounce` and `useResolveOnChange`.

→ [See detailed documentation](./EXPO_HOOKS.md)

### [providers/](./EXPO_PROVIDERS.md)

React context providers: Convex, react-i18next, Motion, PostHog. Includes async providers for tracking and side effects.

→ [See detailed documentation](./EXPO_PROVIDERS.md)

### [ui/](./EXPO_UI.md)

Isolated UI system following React Native best practices. Components, hooks, and utils that should NOT interact with Convex. Maintains separation between UI and business logic.

→ [See detailed documentation](./EXPO_UI.md)

### modules/

Feature-based modules for complex, reusable features. Organize self-contained features with their own components, hooks, and utilities.

### lib/

Library integrations and helpers (Convex client, PostHog, image processing, S3, etc.).
More information in the lib readme folder.