# PostHog Analytics

PostHog integration for event tracking with both client-side and server-side support.

## Setup

Client-side tracking is configured in [src/providers/posthog.tsx](../../../src/providers/posthog.tsx) with automatic pageview tracking. Events are defined in [src/lib/posthog/events.ts](../../../src/lib/posthog/events.ts).

## Server-Side Tracking

Use `posthogSSR` to track events from server-side code (API routes, server actions, etc.):

```typescript
import { posthogSSR } from '@/lib/posthog'

// Track an event
posthogSSR(user._id)?.captureAndClose(({ events }) => ({
  event: events.TASK.EDIT.IMAGE.STARTED,
  properties: { taskId: run.id },
}))
```

### Key Points

- **Automatic identify**: The function identifies the user based on the provided ID
- **captureAndClose**: Captures the event and immediately closes the connection (recommended for one-off events)
- **Typed events**: Use the `events` object for type-safe event names

### Alternative Usage

```typescript
// Multiple events (manually close)
const posthog = posthogSSR(userId)
if (posthog) {
  posthog.capture(({ events }) => ({
    event: events.USER_SIGN_IN,
    properties: { method: 'email' }
  }))
  posthog.capture({ event: 'custom_event', properties: {} })
  posthog.close()
}

// Using session object
posthogSSR({ user: { id, email, name } })?.captureAndClose('event_name')
```

See [src/lib/posthog/ssr.ts](../../../src/lib/posthog/ssr.ts) for implementation details.
