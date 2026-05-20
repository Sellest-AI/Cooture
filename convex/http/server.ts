import { internal } from "../_generated/api";
import { httpAction } from "../_generated/server";
import { env } from "../env";

export const removeBackgroundHandler = httpAction(async (ctx, request) => {
  // Handle the Remove Background webhook request here
  const json = await request.json();
  const _serverKey = json._serverKey;

  if (_serverKey !== env.SERVER_PRIVATE_KEY) throw new Error("Invalid API key");

  await ctx.runAction(internal.llm.triggers.removeBackground._internal, {
    base64: json.base64,
    url: json.url,
    userId: json.userId,
    nextStep: json.nextStep,
    nextArgs: json.nextArgs,
  });

  return Response.json({ received: true }, { status: 200 });
});