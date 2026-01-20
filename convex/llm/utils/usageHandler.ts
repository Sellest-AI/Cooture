import { UsageHandler } from "@convex-dev/agent";
// import { internal } from "../../_generated/api";
import { models } from "../config";
import { Id } from "../../_generated/dataModel";

const baseRatio = models.orchestrator.smartest.pricing.inputTokens / models.orchestrator.smartest.pricing.outputTokens;

interface ModelPricing {
  inputTokens: number;
  outputTokens: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const findModelPricing = (modelId: string, obj: any = models): ModelPricing | null => {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const value = obj[key];

    // If we found a model key with a matching modelId
    if (key === "model" && value?.modelId === modelId) {
      // Go up to parent to find pricing
      if (obj.pricing) {
        return obj.pricing;
      }
      return null;
    }

    // Recursively search in nested objects
    if (typeof value === "object" && value !== null && !value.modelId) {
      const result = findModelPricing(modelId, value);
      if (result) return result;
    }
  }

  return null;
}

export const usageHandler: UsageHandler = async (ctx, run) => {
  const userId = run.userId as Id<'users'> | undefined;
  if (!userId) return;

  // Find pricing for the specific model used, fallback to base ratio
  const modelId = run.model || '';
  const pricing = findModelPricing(modelId);
  const ratio = pricing ? pricing.inputTokens / pricing.outputTokens
    : baseRatio;

  try {
    console.log('TODO: Implement usageHandler to charge tokens', ratio);
    // await ctx.runMutation(internal.router.subscription.cost.payTokens._internal, {
    //   userId: userId,
    //   ratio: ratio,
    //   usage: {
    //     reasoningTokens: run.usage.reasoningTokens || 0,
    //     inputTokens: run.usage.inputTokens || 0,
    //     outputTokens: run.usage.outputTokens || 0,
    //   }
    // });
  } catch { }
}