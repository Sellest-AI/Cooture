import { usePostHog } from "posthog-react-native";
import { useEffect, useRef } from "react";

type Parameters = {
  /** @default true */
  enabled?: boolean;
  [key: string]: any;
}


export const useTrackValues = (event: string, properties?: Parameters) => {
  const posthog = usePostHog();
  const previousValues = useRef<Record<string, any>>({});

  useEffect(() => {
    if (!posthog || !properties) return;

    const { enabled = true, ...payload } = properties;
    if (!enabled) return;

    let hasChanged = false;
    const currentKeys = Object.keys(payload);
    const previousKeys = Object.keys(previousValues.current);

    if (currentKeys.length !== previousKeys.length) {
      hasChanged = true;
    } else {
      for (const key of currentKeys) {
        if (payload[key] !== previousValues.current[key]) {
          hasChanged = true;
          break;
        }
      }
    }

    if (hasChanged) {
      posthog.capture(event, payload);
      previousValues.current = payload;
    }
  }, [event, posthog, properties]);
}