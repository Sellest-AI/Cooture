"use node"
import { addBase64Header, bufferToBase64, imageBufferFromUrl } from "@shared/node/images";
import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import sharp from "sharp";
import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { getItem } from "../../functions/items";
import { getBackgroundColor } from "../../functions/outfits";

type Item = NonNullable<Awaited<ReturnType<typeof getItem>>>;
type ItemPosition = Item['position'];

type Column = {
  items: {
    xPourcent: number;
    yPourcent: number;
    widthPourcent: number;
    heightPourcent: number;
    zIndex: number;
    item: Item;
    position: 'top' | 'center' | 'bottom'
  }[];
  xPourcent: number;
  widthPourcent: number;
}

type ColumnLimits = {
  bottomPourcent: number;
  topPourcent: number;
  leftPourcent: number;
  widthPourcent: number;
}

type ExtraItemProcessingData = {
  isHorizontal: boolean;
  item: Item;
  index: number;
  previousItem: Column['items'][number] | undefined;
  limits: ColumnLimits;
  isLast: boolean;
  isFirst: boolean;
}

type ExtraItemProcessing = (data: ExtraItemProcessingData) => {
  widthPourcent: number;
  heightPourcent: number;
  xPourcent: number;
  yPourcent: number;
  zIndex: number;
  position: 'top' | 'center' | 'bottom';
}

const compileColumn = (limits: ColumnLimits, items: Item[], extraItemProcessing: ExtraItemProcessing): Column => {
  const columnItems: Column['items'] = [];

  items.forEach((item, index) => {
    const isHorizontal = (item.image.width / item.image.height) > 1.2;
    const isLast = index === items.length - 1;
    const isFirst = index === 0;

    const result = extraItemProcessing({
      isHorizontal,
      item,
      previousItem: columnItems[index - 1],
      limits,
      isLast,
      isFirst,
      index,
    });

    const { widthPourcent, heightPourcent, xPourcent, yPourcent, zIndex, position } = result;

    columnItems.push({
      xPourcent,
      yPourcent,
      widthPourcent,
      heightPourcent,
      zIndex,
      item,
      position
    })
  });

  return {
    items: columnItems.sort((a, b) => a.zIndex - b.zIndex),
    xPourcent: limits.leftPourcent,
    widthPourcent: limits.widthPourcent
  };
}

const leftPositions: ItemPosition[] = ['BOTTOM', 'LEGWEAR', 'ACCESSORY', 'SHOES'];
const rightPositions: ItemPosition[] = ['UNDERWEAR', 'INNERLAYER', 'TOP', 'OUTERWEAR'];

const updateCover = async ({ items }: { items: Item[] }) => {
  const DIMENSIONS = { width: 880, height: 1184 };
  const composite: (sharp.OverlayOptions)[] = [];

  const leftItems = items.filter((i) => {
    let accepted = false;
    if (['BOTTOM', 'LEGWEAR', 'SHOES'].includes(i.position)) accepted = true;
    if (i.category === 'DRESS') accepted = true;
    // If it's a bag and the outfit is a dress, we can put it over the dress
    if (i.category === 'BAG' && items.some((i) => i.category === 'DRESS')) accepted = true;
    return accepted;
  }).sort((a, b) => {
    // Sort based on the array order of positions
    const aIndex = leftPositions.indexOf(a.position);
    const bIndex = leftPositions.indexOf(b.position);
    return bIndex - aIndex;
  })

  const rightItems = items.filter((i) => {
    let accepted = false;
    if (leftItems.some(li => li._id === i._id)) return false;
    if (rightPositions.includes(i.position)) accepted = true;
    return accepted;
  }).sort((a, b) => {
    // Sort based on the array order of positions
    const aIndex = rightPositions.indexOf(a.position);
    const bIndex = rightPositions.indexOf(b.position);
    return aIndex - bIndex;
  })

  const accessoriesItems = items.filter((i) => {
    let accepted = false;
    if (leftItems.some(li => li._id === i._id)) return false;
    if (rightItems.some(ri => ri._id === i._id)) return false;
    if (i.position === 'ACCESSORY') accepted = true;
    return accepted;
  });

  const hasRightColumn = rightItems.length > 0 || accessoriesItems.length > 0;

  const leftColumn = compileColumn({
    bottomPourcent: 5,
    topPourcent: hasRightColumn ? 10 : 5,
    leftPourcent: hasRightColumn ? 5 : 20,
    widthPourcent: 45
  }, leftItems, (data) => {
    const { isHorizontal, item, previousItem, limits, index, isLast, isFirst } = data;

    const _widthPourcent = (isHorizontal && isLast) ? limits.widthPourcent * 1.2 : limits.widthPourcent;
    const bagWidth = limits.widthPourcent * 0.8;
    const widthPourcent = item.category === 'BAG' ? bagWidth : _widthPourcent;

    const heightPourcent = (item.image.height / item.image.width) * limits.widthPourcent;

    const defaultY = previousItem?.yPourcent ?? (100 - limits.bottomPourcent);
    const expectedY = defaultY - heightPourcent;
    const expectedYWhenLast = (isLast && index === 1 && isHorizontal) ? expectedY * 0.8 : expectedY;
    const expectedYWhenLegwear = (item.position === 'LEGWEAR' && !isFirst) ? 100 - limits.bottomPourcent - (heightPourcent * 1.2) : expectedYWhenLast;
    const yPourcent = Math.max(expectedYWhenLegwear, limits.topPourcent);

    // Shoes must be a bit centered
    const hasAccessories = accessoriesItems.length > 0;
    const xPourcent = item.position === 'SHOES' ?
      limits.leftPourcent + (hasAccessories ? 7 : 15) : limits.leftPourcent;

    // Legwears always at the bottom
    const zIndex = item.position === 'LEGWEAR' ? 0 : leftItems.length - index;

    return {
      position: isLast ? 'top' : 'bottom',
      widthPourcent,
      heightPourcent,
      xPourcent,
      yPourcent,
      zIndex
    }
  });

  const rightColumn = compileColumn({
    bottomPourcent: rightItems.length > 0 ? 10 : 25,
    topPourcent: 5,
    leftPourcent: 40,
    widthPourcent: 57
  }, rightItems, (data) => {
    const { item, previousItem, limits, index } = data;
    const widthPourcent = limits.widthPourcent;
    const heightPourcent = (item.image.height / item.image.width) * widthPourcent;

    const expectedYPourcent = limits.topPourcent + (previousItem?.heightPourcent ?? 0) * 0.5;
    // Center the item if it's the only one in the column
    const accessoryOffset = accessoriesItems.length > 0 ? (2 + (0.5 * accessoriesItems.length)) : 2;
    const singleItemYPourcent = rightItems.length === 1 ? (100 - limits.bottomPourcent - heightPourcent) / accessoryOffset : expectedYPourcent;

    const yPourcent = Math.min(singleItemYPourcent, 100 - limits.bottomPourcent);

    const xPourcent = limits.leftPourcent;

    const zIndex = index;

    return {
      position: 'center',
      widthPourcent,
      heightPourcent,
      xPourcent,
      yPourcent,
      zIndex
    }
  });

  const accessoriesColumn = compileColumn({
    bottomPourcent: 10,
    topPourcent: 30,
    leftPourcent: 58,
    widthPourcent: 30
  }, accessoriesItems, (data) => {
    const { isHorizontal, item, previousItem, limits, index } = data;
    const widthPourcent = isHorizontal ? limits.widthPourcent * 1.2 : limits.widthPourcent;

    const minY = 100 - (limits.topPourcent + limits.bottomPourcent);

    const expectedHeightPourcent = (item.image.height / item.image.width) * limits.widthPourcent;
    const heightPourcent = Math.min(expectedHeightPourcent, minY);

    const expectedYPourcent = (100 - limits.bottomPourcent) - heightPourcent - (previousItem?.heightPourcent ?? 0);
    const yPourcent = Math.max(expectedYPourcent, limits.topPourcent);

    const xPourcent = limits.leftPourcent;

    const zIndex = accessoriesItems.length - index;

    return {
      position: 'center',
      widthPourcent,
      heightPourcent,
      xPourcent,
      yPourcent,
      zIndex
    }
  });

  const promises = [...rightColumn.items, ...accessoriesColumn.items, ...leftColumn.items]

  for await (const data of promises) {
    const { xPourcent, yPourcent, widthPourcent, heightPourcent, item, position } = data;
    const _left = Math.round((xPourcent / 100) * DIMENSIONS.width);
    const _top = Math.round((yPourcent / 100) * DIMENSIONS.height);
    const _width = Math.round((widthPourcent / 100) * DIMENSIONS.width);
    const _height = Math.round((heightPourcent / 100) * DIMENSIONS.height);

    const left = Math.max(_left, 0);
    const top = Math.max(_top, 0);
    const width = Math.min(_width, DIMENSIONS.width - left);
    const height = Math.min(_height, DIMENSIONS.height - top);

    let image = sharp(await imageBufferFromUrl(item.image.url));
    image = image.resize({
      width,
      height,
      fit: 'contain',
      background: 'transparent',
      position: position,
    });

    composite.push({
      input: await image.webp().toBuffer(),
      top,
      left,
    })
  }

  const base = sharp({
    create: {
      width: DIMENSIONS.width,
      height: DIMENSIONS.height,
      channels: 4,
      background: 'transparent'
    }
  })

  const output = bufferToBase64(await base.composite(composite).webp().toBuffer());
  const imageBase64 = addBase64Header(output, 'webp');

  return imageBase64;
}

export const _internal = internalAction({
  args: {
    outfitId: v.id("outfits")
  },
  handler: async (ctx, { outfitId }): Promise<boolean> => {
    const outfit = await ctx.runQuery(internal.router.outfits.getOne._internal, { outfitId });
    if (!outfit) return false;

    const _items = await Promise.all(outfit.items.map(item => ctx.runQuery(internal.router.items.getOne._internal, { itemId: item._id })));
    const items = _items.filter(notEmpty);

    const imageBase64 = await updateCover({ items });

    const newImage = await ctx.runAction(internal.router.storage.images.uploadMany._internal, {
      userId: outfit.userId,
      images: [{
        base64: imageBase64,
      }]
    });

    if (newImage.length === 0) return false;

    const backgroundColor = getBackgroundColor(items.map(i => i.mainColors[0]).filter(notEmpty));

    await ctx.runMutation(internal.router.outfits.updateCoverInternal._internal, {
      outfitId,
      newCoverId: newImage[0]._id,
      backgroundColor,
    });

    return true;
  }
})
