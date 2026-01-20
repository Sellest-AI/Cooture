### `schema.ts` - Database Schema

A wrapper file that re-exports all table definitions from the `schema/` folder.

**Structure**:
```typescript
// convex/schema.ts
import { defineSchema } from "convex/server";
import { authTables } from "./schema/auth";
import { usersExtended, userImages } from "./schema/users";
import { images, imageSizes, imageObjects } from "./schema/images";

export default defineSchema({
  ...authTables,
  usersExtended,
  images,
  imageSizes,
  imageObjects,
  userImages,
  // [...]
});
```

**Organization Pattern**:
- Main file: `schema.ts` (aggregates everything)
- Definitions: `schema/` folder (one file per domain)
- File naming: **Plural** (e.g., `users.ts`, `images.ts`, `subscriptions.ts`)
- Each schema file exports related table definitions

**Example Schema File**:
```typescript
// convex/schema/users.ts
import { defineTable } from "convex/server";
import { v } from "convex/values";

const role = v.union(
  v.literal("ADMIN"),
  v.literal("USER"),
  v.literal("GUEST"),
);

export const usersExtended = defineTable({
  userId: v.id('users'),
  canTakeFreeTrial: v.boolean(),
  stripeCustomerId: v.string(),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  role: role,
})
  .index("by_user_id", ["userId"])
  .index("by_stripe_customer_id", ["stripeCustomerId"]);
```