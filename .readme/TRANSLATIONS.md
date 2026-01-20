# `translations/` - Internationalization

Handles all translation files and i18n utilities using react-i18next for React Native/Expo.

**Import Patterns**:
```typescript
// React Native components
import { useTranslations } from "translations";

function Component() {
  const t = useTranslations("Home");
  return <Text>{t("title")}</Text>;
}
```

**Structure**:
```
translations/
├── index.ts              # Main exports
├── translations.ts       # i18n configuration & initialization
├── types.d.ts            # Translation types definition
├── en/                   # English translations
│   ├── common.json
│   └── home.json
└── fr/                   # French translations
    ├── common.json
    └── home.json
```

## Translations — Conventions & Usage

This document explains how translation files are organized and how to add new translations.

## Overview
- Folder: `translations/`
- Exports: `index.ts`
- i18n config: `translations.ts` (registers which JSON files to load)
- Types: `types.d.ts` (keep in sync with files)
- Provider: `expo/providers/i18n.tsx` (wraps app with I18nextProvider)

## File architecture
- Split translations by module, page, or namespace. Each JSON file contains grouped sections.
- Use `common.json` for shared/common labels across the app.

Recommended layout (already present):
- `en/home.json` — Home page translations (sections: `Metadata`, `Hero`, ...)
- `en/common.json` — Shared/common translations
- `fr/*` — Same structure for French

## Naming conventions
- Sections: CamelCase and start with an uppercase letter (e.g. `Hero`, `Metadata`, `UserCard`).
- Keys (translation identifiers): snake_case, lowercase (e.g. `title`, `description_unstylized`, `x_members`).
- Nest sections inside files to group related keys.

Example structure inside a JSON file:

```
{
  "Hero": {
    "title": "Welcome to Our Application",
    "subtitle": "Your journey starts here"
  },
  "Metadata": {
    "description_unstylized": "This is the home page of our application."
  }
}
```

## Plurals & variables
- Use ICU message format for plurals and variable interpolation.
- Examples:

Plural example:

```json
{
"x_members": "{count, plural, =0 {No members} one {# member} other {# members}}"
}
```

Variable interpolation example:

```json
{
  "welcome_user_x_messages": "Welcome, {name}! You have {count} new {count, plural, =0 {message} one {# message} other {# messages}}."
}
```

On usage: pass variables to the translation function provided by `react-i18next`.

## Adding a new translation file
1. Create the JSON file under each locale folder (e.g. `en/notifications.json` and `fr/notifications.json`).
   - Structure it by Sections and keys as described above.

2. Add the imports to `translations/translations.ts`:

```ts
// Add imports at the top
import enNotifications from './en/notifications.json';
import frNotifications from './fr/notifications.json';

// Update the resources
i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        Home: enHome,
        Common: enCommon,
        Notifications: enNotifications, // <-- new
      },
    },
    fr: {
      translation: {
        Home: frHome,
        Common: frCommon,
        Notifications: frNotifications, // <-- new
      },
    },
  },
  // ... rest of config
});
```

3. Update `translations/types.d.ts`:
   - Import the new file's English JSON (used for typing):

```ts
import notifications from './en/notifications.json';

type Messages =
  MessageNamespace<'Home', typeof home> &
  MessageNamespace<'Common', typeof common> &
  MessageNamespace<'Notifications', typeof notifications>;
```

4. Ensure the JSON keys follow Sections (CamelCase) and snake_case keys.

## Tips & best practices
- Keep files focused by page or feature.
- Reuse `common.json` for generic actions like `confirm`, `cancel`, `save`, `delete`.
- Use pluralization for counts and always provide clear fallback translations.
- Prefer descriptive section names (e.g., `ProfileForm`, `Billing`, `Errors`).

## Checklist when adding translations
- [ ] Add JSON files for each supported locale (en/, fr/)
- [ ] Import files in `translations/translations.ts` resources
- [ ] Update `translations/types.d.ts` with import and `MessageNamespace`
- [ ] Follow Section/Key naming conventions
