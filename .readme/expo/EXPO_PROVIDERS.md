# Providers

React context providers for the application, organized in [expo/providers/](../../expo/providers/).

## Main Providers

Configured in [expo/providers/index.tsx](../../expo/providers/index.tsx):

- **ConvexClientProvider**: Convex real-time database with auth and query caching
- **I18nProvider**: Internationalization support using react-i18next (synchronous initialization)
- **MotionProvider**: Framer Motion animation configuration
- **PostHogProvider**: Analytics and feature flags

## Async Providers

Located in [expo/providers/async/](../../expo/providers/async/), these are dynamically loaded and primarily used for tracking and side effects:

- **ThemeProvider**: Syncs theme state with Tailwind CSS (applies dark class to body)
- **PostHogPageView**: Automatic pageview tracking for analytics

Async providers render without blocking the initial page load.
