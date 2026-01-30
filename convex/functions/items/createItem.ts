import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { ActionCtx } from "../../procedures";

type Args = {
  imageId: Id<"images">;
  userId: Id<"users">;
}

export const createItem = async (ctx: ActionCtx, data: Args): Promise<Id<"items">> => {
  const schema = await ctx.runAction(internal.llm.triggers.itemCategorizer._internal, {
    imageId: data.imageId,
    userId: data.userId,
    extractText: true,
  })

  const item = await ctx.runMutation(internal.router.items.createOne._internal_mutation, {
    ...schema,
    userId: data.userId,
    name: schema.name || 'Untitled Item',
    description: schema.description || undefined,
    mainColors: schema.mainColors,
    imageId: data.imageId,
  });

  return item;
}