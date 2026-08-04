import { requireTestAccount } from "../../functions/auth/testAccount";
import { publicMutation } from "../../procedures";

/**
 * Returns the shared tester credentials so the "sign in as tester" button can complete a
 * password sign-in. It is unauthenticated by necessity — it runs before sign-in.
 *
 * The mitigation is therefore that it has nothing to hand out unless the deployment
 * explicitly opts in: `requireTestAccount()` throws unless both TEST_ACCOUNT_EMAIL and
 * TEST_ACCOUNT_PASSWORD are set. Do not set them in production (03-FLAWS F4).
 */
export const anon = publicMutation({
  handler: async () => requireTestAccount(),
})
