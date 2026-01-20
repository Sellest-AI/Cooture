### `functions/` - Reusable Business Logic

Contains reusable functions that interact with the database (and other linked business logic). These help avoid code duplication across routes.

**Pattern**: Functions take `ctx` as first parameter, then additional arguments.

**Real Example**:
```typescript
// convex/functions/users/getAccount.ts
import { Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../_generated/server";

export const getAccount = async (ctx: QueryCtx, userId: Id<'users'>) => {
  const user = await ctx.db.get(userId);
  if (!user) return null;

  const userExtended = await ctx.db.query("usersExtended")
    .withIndex('by_user_id', (q) => q.eq("userId", userId))
    .first();

  return { ...userExtended, ...user };
};
```

**Organization**:
```
functions/
├── users/
│   ├── getAccount.ts
│   ├── index.ts           # Re-exports all user functions
├── subscriptions/
│   ├── getUserSubscription.ts
│   ├── isSubscriptionActive.ts
│   └── index.ts
└── images/
    ├── getImage.ts
    ├── saveImage.ts
    └── index.ts
```

**Usage in Routes**:
```typescript
// convex/router/users/getCurrentUser.ts
import { authQuery } from "../../procedures";
import { getAccount } from "../../functions/users";

export const authed = authQuery({
  args: {},
  handler: async (ctx, args) => {
    return await getAccount(ctx, ctx.userId);
  },
});
```

**Key Rule**: If logic interacts with database, put it in `functions/`. If it's a pure utility and not business related (no DB), put it in `lib/`.