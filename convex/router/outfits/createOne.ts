import { faker } from '@faker-js/faker';
import { Infer, v } from "convex/values";
import { internal } from "../../_generated/api";
import { upsertFeedScore } from "../../functions/feed";
import { isOutfitNFSW } from '../../functions/outfits';
import { updateQuest } from '../../functions/quests';
import { adminMutation, authMutation, MutationCtx } from "../../procedures";

const args = {
  name: v.optional(v.string()),
  items: v.array(v.id("items"))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const argsObject = v.object({ ...args, userId: v.id("users") });
type Args = Infer<typeof argsObject>;

const handler = async (ctx: MutationCtx, args: Args) => {
  const fallbackName = [
    faker.commerce.productAdjective(),
    faker.helpers.maybe(() => faker.science.chemicalElement().name, { probability: 0.3 }),
    faker.animal.petName(),
  ].filter(Boolean).join(' ');

  const contentRating = await isOutfitNFSW(ctx, args.items);

  const outfit = await ctx.db.insert('outfits', {
    name: args.name || fallbackName,
    userId: args.userId,
    updatedAt: Date.now(),
    contentRating
  })

  for (const itemId of args.items) {
    await ctx.db.insert('outfitItems', {
      outfitId: outfit,
      itemId,
    })
  }

  await upsertFeedScore(ctx, { outfitId: outfit });

  await ctx.scheduler.runAfter(0, internal.router.outfits.updateCover._internal, { outfitId: outfit });

  await updateQuest(ctx, { userId: args.userId, questType: "outfits_created", increment: 1 });

  return outfit;
}

export const authed = authMutation({
  args,
  handler: (ctx, args) => handler(ctx, { ...args, userId: ctx.userId })
})

export const admin = adminMutation({
  args: { ...args, userId: v.id("users") },
  handler: handler
})