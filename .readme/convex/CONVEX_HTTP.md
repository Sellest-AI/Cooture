### `http.ts` - HTTP Endpoints

Defines HTTP routes for webhooks, REST APIs, and external integrations.

**Current Implementation**:
```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { stripeWebhookHttpAction } from "./router/stripe/http.webhook";

const http = httpRouter();

// Custom webhook endpoint
http.route({
  path: "/api/webhooks/stripe",
  method: "POST",
  handler: stripeWebhookHttpAction,
});

// Auth routes (login, signup, OAuth callbacks)
auth.addHttpRoutes(http);

export default http;
```

**Future Consideration**: If many endpoints are added, refactor into `http/` folder and re-export like schema folder.