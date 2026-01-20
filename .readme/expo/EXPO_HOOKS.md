# Application Hooks

Shared React hooks for common application patterns, located in [src/hooks/](../../src/hooks/). These are abstracted hooks not directly tied to UI components.

**Note**: Unlike [src/ui/](../../src/ui/), these hooks CAN interact with Convex and application-specific logic.

## Available Hooks

### useDebounce

Debounce value changes to reduce unnecessary updates:

```typescript
import { useDebounce } from '@/hooks'

// Basic usage - returns debounced value
const debouncedSearch = useDebounce(searchQuery, 300)

// Extended usage - with manual force update
const { value: debouncedValue, forceDebounceUpdate } = useDebounce.Extended(input, 500)
forceDebounceUpdate() // Immediately apply the latest value
```

Handles object comparison via JSON serialization.

### useResolveOnChange

Wait for a value to change from undefined/falsy to defined/truthy:

```typescript
import { useResolveOnChange } from '@/hooks'

const { waitForValue, cancel } = useResolveOnChange(userId, {
  interval: 100, // polling interval (default: 100ms)
  shouldResolve: (val) => Boolean(val) // custom resolution condition
})

// Wait for value to become truthy
const { value, hasChanged } = await waitForValue({
  onWaitStart: () => console.log('Waiting...'),
  onSuccess: (result) => console.log('Resolved:', result),
  onFail: (error) => console.log('Failed:', error)
})

// Cancel waiting if needed
cancel()
```

Useful for waiting on async data, authentication state, or conditional rendering logic.
