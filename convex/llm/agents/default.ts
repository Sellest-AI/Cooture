import { Agent, ToolCtx } from "@convex-dev/agent";
import { components } from "../../_generated/api";
import { models } from "../config";
import { usageHandler } from "../utils";

export const defaultAgent = new Agent(components.agent, {
  name: "Default Agent",
  providerOptions: models.reasoning.smart.providerOptions({ effort: 'high' }),
  languageModel: models.reasoning.smart.model,
  instructions: "",
  contextOptions: { recentMessages: 0, searchOptions: { limit: 0 } },
  maxSteps: 7,
  usageHandler,
});

type Message = Parameters<typeof defaultAgent['generateText']>;
export const generateText = (ctx: ToolCtx, message: Message[2], options: Message[3]) =>
  defaultAgent.generateText(ctx, { threadId: ctx.threadId, userId: ctx.userId }, message, options);