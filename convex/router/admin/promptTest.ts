import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { schemaToMarkdown } from "../../llm/utils/photoshoot";

export const _internal = internalAction({
  args: {
    json: v.string(),
  },
  handler: async (ctx, args) => {
    const data = JSON.parse(args.json);

    const result = schemaToMarkdown(data);

    return {
      characters: result.length,
      result,
    };
  }
})