import { ConvexError } from "convex/values";
import { env } from "../../env";

export type TestAccountCredentials = { email: string, password: string };

/**
 * Credentials for the shared tester account.
 *
 * They used to be hardcoded and handed out by a public, unauthenticated mutation, so
 * anyone with the deployment URL could sign in as that account (03-FLAWS F4). They now
 * come from `TEST_ACCOUNT_EMAIL` / `TEST_ACCOUNT_PASSWORD`, which must be set on dev and
 * preview deployments and left unset in production — leaving them unset is what turns the
 * feature off, and it is off by default.
 */
export const readTestAccount = (): TestAccountCredentials | null => {
  const email = env.TEST_ACCOUNT_EMAIL;
  const password = env.TEST_ACCOUNT_PASSWORD;

  if (!email || !password) return null;
  return { email, password };
};

export const requireTestAccount = (): TestAccountCredentials => {
  const account = readTestAccount();
  if (!account) throw new ConvexError("Test account sign-in is disabled on this deployment");
  return account;
};
