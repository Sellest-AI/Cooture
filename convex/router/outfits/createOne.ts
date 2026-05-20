import { en, Faker, fr } from '@faker-js/faker';
import { extractDominantVibrantColor, hslStringToHsl, hslToHex, notEmpty } from '@shared/utils';
import { colornames } from 'color-name-list';
import { Infer, v } from "convex/values";
import nearestColor from 'nearest-color';
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
  const items = await Promise.all(args.items.map((id) => ctx.db.get(id)));
  const itemsColors = items.filter(notEmpty).map((i) => i.mainColors).flat();
  const mainColorHslString = await extractDominantVibrantColor(itemsColors);
  const mainColorHsl = mainColorHslString ? hslStringToHsl(mainColorHslString) : null;
  const mainColorHex = mainColorHsl ? hslToHex(...mainColorHsl) : null;

  // nearestColor expects an object { name => hex }
  const colors = colornames.reduce((o, { name, hex }) => Object.assign(o, { [name]: hex }), {});
  const nearest = nearestColor.from(colors);
  const hasColor = mainColorHex ?? itemsColors[0];
  const expectedColorName = hasColor ? nearest(mainColorHex ?? itemsColors[0]) : null;
  const colorName = hasColor ? expectedColorName?.name : undefined;

  const faker = new Faker({ locale: [en, fr] });
  faker.seed(Date.now() + Math.floor(Math.random() * 1000000))

  const fallbackName = [
    faker.commerce.productAdjective(),
    faker.helpers.maybe(() => faker.science.chemicalElement().name, { probability: 0.3 }),
    faker.animal.petName(),
  ].filter(Boolean).join(' ');

  const contentRating = await isOutfitNFSW(ctx, args.items);

  const outfit = await ctx.db.insert('outfits', {
    name: args.name || colorName || fallbackName,
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