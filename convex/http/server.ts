import { internal } from "../_generated/api";
import { httpAction } from "../_generated/server";
import { env } from "../env";

const checkApiKey = async (request: Request) => {
  // Handle the Remove Background webhook request here
  const json = await request.json();
  const _serverKey = json._serverKey;

  if (_serverKey !== env.SERVER_PRIVATE_KEY) throw new Error("Invalid API key");

  return json;
}

export const removeBackgroundHandler = httpAction(async (ctx, request) => {
  const json = await checkApiKey(request);

  await ctx.runAction(internal.llm.triggers.removeBackground._internal, {
    base64: json.base64,
    url: json.url,
    userId: json.userId,
    nextStep: json.nextStep,
    nextArgs: json.nextArgs,
  });

  return Response.json({ received: true }, { status: 200 });
});

export const botsListHandler = httpAction(async (ctx, request) => {
  await checkApiKey(request);

  const bots = await ctx.runQuery(internal.router.admin.bots.getAll._internal);
  return Response.json({ bots }, { status: 200 });
});