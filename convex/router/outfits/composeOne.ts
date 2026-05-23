import { getTagsFromHexColors } from '@/lib/color';
import { convertTagsToString } from '@/lib/helpers';
import { en, Faker } from '@faker-js/faker';
import { notEmpty } from '@shared/utils';
import { v } from "convex/values";
import { api } from '../../_generated/api';
import { Doc } from '../../_generated/dataModel';
import { authQuery, publicQuery, QueryCtx, serverQuery } from "../../procedures";
import { ITEM_STYLES, OUTFIT_PALETTES } from '../../schema/constants';
import { ITEMS_SCHEMA } from '../../schema/items';

type Style = typeof ITEM_STYLES[number];

const handler = async (ctx: QueryCtx, args: {
  seed: number | string,
  hexPalettes?: string[][],
  gender: 'male' | 'female',
  styles?: string[],
  allowPublicOutfits: boolean,
}) => {
  let seed = Number(args.seed);

  const faker = new Faker({ locale: en });
  faker.seed(seed);

  const settings = await ctx.runQuery(api.router.outfits.composeOne.settings);
  const targetStyle = faker.helpers.arrayElement(args.styles as string[] ?? settings.styles) as Style;
  const targetPalette = faker.helpers.arrayElement(args.hexPalettes ?? settings.palettes.map(p => p.colors));

  const colorTagsArray = getTagsFromHexColors(targetPalette);
  const searchTerms = `${convertTagsToString(colorTagsArray)} ${targetStyle}`;

  const generatedOutfits = await ctx.db
    .query("suggestedOutfits")
    .withSearchIndex("search_text", (q) => {
      const query = q.search("searchableText", searchTerms);
      // if (!args.allowPublicOutfits) return query.eq('userId', ctx.userId);
      return query;
    })
    .take(100);

  // Filter exactly by the requested colors and style just to be safe
  const validOutfits = generatedOutfits.filter(o =>
    o.styles.includes(targetStyle)
    // colorTagsArray.some(tag => o.colorTags.includes(tag))
  );

  const shuffledOutfits = faker.helpers.shuffle(validOutfits);

  for await (const outfit of shuffledOutfits) {
    const itemDocs = (await Promise.all(outfit.items.map(id => ctx.db.get(id)))).filter(notEmpty);
    const invalidMaleTerms = ['heel', 'skirt', 'dress', 'jumpsuit', 'romper', 'overall'];

    const hasInvalidTerm = (item: Doc<'items'>, terms: string[]) => {
      const isInName = terms.some(term => item.name.toLowerCase().includes(term));
      const isInDescription = terms.some(term => item.description?.toLowerCase().includes(term));
      return isInName || isInDescription;
    }

    const isMale = args.gender === 'male';
    const hasInvalidMaleItems = isMale && itemDocs.some(item => hasInvalidTerm(item, invalidMaleTerms));

    if (hasInvalidMaleItems)
      continue; // Skip this outfit and move to the next one

    return {
      seed: seed,
      items: itemDocs,
    }
  }

  return null;
}

export const authed = authQuery({
  args: {
    seed: v.union(v.number(), v.string()),
    hexPalettes: v.optional(v.array(v.array(v.string()))),
    styles: v.optional(ITEMS_SCHEMA.styles),
    allowPublicOutfits: v.boolean(),
  },
  handler: async (ctx, args) => {
    const appearance = await ctx.db.query('usersAppearance').withIndex('by_user_id', q => q.eq('userId', ctx.userId)).first();
    const isMale = appearance?.gender === 'male';

    return handler(ctx, { ...args, gender: isMale ? 'male' : 'female' });
  }
});

export const server = serverQuery({
  args: {
    seed: v.union(v.number(), v.string()),
    hexPalettes: v.optional(v.array(v.array(v.string()))),
    styles: v.optional(ITEMS_SCHEMA.styles),
    gender: v.union(v.literal('male'), v.literal('female')),
  },
  handler: async (ctx, args) => {
    return handler(ctx, { ...args, allowPublicOutfits: true });
  }
});

export const settings = publicQuery({
  handler: async (ctx) => {
    const styles = ITEM_STYLES;
    const palettes = OUTFIT_PALETTES;

    const filteredPalettes = await Promise.all(palettes.map(async (palette) => {
      const colorTagsArray = getTagsFromHexColors(palette.colors);
      const searchTerms = convertTagsToString(colorTagsArray);

      const matchingOutfits = await ctx.db
        .query("suggestedOutfits")
        .withSearchIndex("search_text", (q) => q.search("searchableText", searchTerms))
        .take(1);

      const filteredOutfits = matchingOutfits.filter(o =>
        palette.colors.every(tag => o.mainColors.includes(tag)))

      return filteredOutfits.length > 0 ? palette : null;
    }));

    const filteredStyles = await Promise.all(styles.map(async (style) => {
      const searchTerms = `${style}`;
      const matchingOutfits = await ctx.db
        .query("suggestedOutfits")
        .withSearchIndex("search_text", (q) => q.search("searchableText", searchTerms))
        .take(1);

      return matchingOutfits.length > 0 ? style : null;
    }));

    return {
      styles: filteredStyles.filter(notEmpty),
      palettes: filteredPalettes.filter(notEmpty),
    };

  }
})