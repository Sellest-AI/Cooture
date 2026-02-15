import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  clientPrefix: "PUBLIC_",
  /*
   * Environment variables available on the client (and server (not available in react-native)).
   *
   */
  client: {
    PUBLIC_CONVEX_URL: z.url(),
    PUBLIC_NODE_ENV: z.enum(["development", "production"]).default('development'),
    PUBLIC_POSTHOG_KEY: z.string().optional(),
    PUBLIC_POSTHOG_HOST: z.string().optional(),
    PUBLIC_AUTH_URL: z.string(),
    PUBLIC_APP_URL: z.string(),
  },
  /*
   * Due to how Expo bundles environment variables,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    NODE_ENV: process.env.EXPO_PUBLIC_CUSTOM_NODE_ENV ?? process.env.NODE_ENV,
    PUBLIC_NODE_ENV: process.env.EXPO_PUBLIC_CUSTOM_NODE_ENV ?? process.env.NODE_ENV,
    PUBLIC_AUTH_URL: process.env.EXPO_PUBLIC_AUTH_URL,
    // convex
    PUBLIC_CONVEX_URL: process.env.EXPO_PUBLIC_CONVEX_URL,
    PUBLIC_POSTHOG_KEY: process.env.EXPO_PUBLIC_POSTHOG_KEY,
    PUBLIC_POSTHOG_HOST: process.env.EXPO_PUBLIC_POSTHOG_HOST,
    PUBLIC_APP_URL: process.env.EXPO_PUBLIC_APP_URL,
  },
});