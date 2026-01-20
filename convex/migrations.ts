import { Migrations } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api.js";
// import { Id } from "./_generated/dataModel.js";

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