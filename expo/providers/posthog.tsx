import { useAccount } from '@/lib/convex/auth';
import { env } from 'env';
import { useGlobalSearchParams, usePathname } from 'expo-router';
import { PostHogProvider as PostHogReactProvider, usePostHog } from 'posthog-react-native';
import { ReactNode, useEffect } from "react";

const PostHogTracker = () => {
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (!posthog) return;
    posthog.screen(pathname, params);
  }, [pathname, params, posthog])

  return null;
}

const PostHogUserIdentification = () => {
  const { userId, user, isAuthenticated } = useAccount();
  const posthog = usePostHog();

  useEffect(() => {
    if (!posthog) return;
    if (userId) {
      if (userId === posthog.getDistinctId()) return;
      posthog.identify(userId, {
        $set: {
          email: user?.email ?? null,
          name: user?.name ?? null,
          username: user?.username ?? null,
        }
      });
    } else if (!isAuthenticated) {
      posthog.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posthog, isAuthenticated, userId])

  return null;
}

export const PostHogProvider = ({ children }: { children: ReactNode }) => {
  return (
    <PostHogReactProvider
      apiKey={env.PUBLIC_POSTHOG_KEY}
      options={{
        host: env.PUBLIC_POSTHOG_HOST,
        enableSessionReplay: true
      }}
    >
      {children}
      <PostHogTracker />
      <PostHogUserIdentification />
    </PostHogReactProvider>
  )
}