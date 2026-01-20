### `lib/` - Third-Party Integrations

Contains library wrappers and third-party service integrations that **do NOT** interact with the database directly.

**Examples**:
- `lib/stripe/` - Stripe payment processing utilities
- `lib/nanoid/` - ID generation
- `lib/image/` - Image processing utilities

**When to use `lib/` vs `functions/`**:
- ✅ `lib/` - Pure functions, external API calls, utility wrappers
- ✅ `functions/` - Database queries/mutations, business logic with DB access

**Structure**:
```
lib/
├── stripe/
│   ├── createCustomer.ts
│   ├── getSubscription.ts
│   ├── stripe.config.ts
│   └── index.ts              # Barrel export
├── image/
│   ├── sanitizeImage.ts
│   └── index.ts              # Barrel export
└── nanoid/
    └── index.ts
```

**Barrel Exports Pattern**:

Use `index.ts` files to re-export all functions from a folder, making imports cleaner and easier to manage.

**Example Barrel Export**:
```typescript
// lib/stripe/index.ts
export * from './createCustomer';
export * from './getSubscription';
export * from './stripe.config';
```

**Benefits**:
```typescript
// ❌ Without barrel exports
import { createCustomer } from "../../lib/stripe/createCustomer";
import { getSubscription } from "../../lib/stripe/getSubscription";

// ✅ With barrel exports
import { createCustomer, getSubscription } from "../../lib/stripe";
```

This pattern makes imports more concise and allows you to refactor internal file structure without breaking imports.