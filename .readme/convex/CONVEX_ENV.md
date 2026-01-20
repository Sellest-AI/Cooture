### `env.ts` - Environment Variables

Centralizes environment variable access for Convex.

**⚠️ IMPORTANT**: Never use `process.env` directly. Always import from `env.ts`.

**Implementation**:
```typescript
// convex/env.ts
export const env = {
  NODE_ENV: process.env.NODE_ENV ?? '',
  FRONTEND_SITE_URL: process.env.FRONTEND_SITE_URL ?? '',
  CONVEX_SITE_URL: process.env.CONVEX_SITE_URL ?? '',
  SERVER_PRIVATE_KEY: process.env.SERVER_PRIVATE_KEY ?? '',
  
  // Optional Services
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? '',
  STRIPE_WEBHOOK_SECRETS: process.env.STRIPE_WEBHOOK_SECRETS ?? '',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ?? '',
  VOYAGE_API_KEY: process.env.VOYAGE_API_KEY ?? '',
};
```

**Usage**:
```typescript
// ❌ WRONG
const apiKey = process.env.STRIPE_SECRET_KEY;

// ✅ CORRECT
import { env } from "../../env";
const apiKey = env.STRIPE_SECRET_KEY;
```
