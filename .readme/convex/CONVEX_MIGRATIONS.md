### `migrations.ts` - Database Migrations

Handles schema migrations when database structure changes. Uses `@convex-dev/migrations` component.

**Real Example**:
```typescript
// convex/migrations.ts
import { Migrations } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api.js";

export const migrations = new Migrations(components.migrations);

// #region Migration to clear images tags
export const clearImagesTags = migrations.define({
  table: "images",
  migrateOne: () => ({ tags: [] }),
});

export const runClearImagesTags = migrations.runner([
  internal.migrations.clearImagesTags,
]);
// #endregion
```

**Key Concepts**:
- `migrations.define()` - Defines a migration for a specific table
- `migrateOne` - Function or object that returns a patch (partial update) for each row
- `migrations.runner()` - Runs multiple migrations in sequence
- Use regions to organize related migrations

**Advanced Example with Function**:
```typescript
// Migration that updates based on existing data
export const normalizeUsernames = migrations.define({
  table: "users",
  migrateOne: (doc) => {
    if (!doc.username) return null; // Skip if no username
    return {
      username: doc.username.toLowerCase().trim(),
      updatedAt: Date.now(),
    };
  },
});

export const runUserMigrations = migrations.runner([
  internal.migrations.normalizeUsernames,
  internal.migrations.addDefaultRoles,
]);
```