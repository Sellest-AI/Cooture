"use node"
import { addBase64Header, bufferToBase64, imageBufferFromUrl } from "@shared/node/images";
import { getLighterHsl, getSaturatedHsl, hslToHex, notEmpty, parseColorToHsl } from "@shared/utils";
import { v } from "convex/values";
import sharp from "sharp";
import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";

type Position = {
  top: number;
  left: number;
  maxWidth: number;
  maxHeight: number;
}
const positionImage = async (url: string | undefined | null, position: Position) => {
  if (!url) return null;

  let image = sharp(await imageBufferFromUrl(url));
  image = image.resize(position.maxWidth, position.maxHeight, { fit: 'inside' });

  return {
    input: await image.webp().toBuffer(),
    top: position.top,
    left: position.left,
  };
}

export const _internal = internalAction({
  args: {
    outfitId: v.id("outfits")
  },
  handler: async (ctx, { outfitId }) => {
    const outfit = await ctx.runQuery(internal.router.outfits.getOne._internal, { outfitId });
    if (!outfit) return false;

    const { items } = outfit;
    const composite: (sharp.OverlayOptions | null)[] = [];

    const top1 = items.find((i) => i.position === 'OUTERWEAR') ??
      items.find((i) => i.position === 'TOP') ?? items.find((i) => i.position === 'INNERLAYER');
    const top2 = items.find((i) => i.position === 'TOP' && i._id !== top1?._id) ??
      items.find((i) => i.position === 'INNERLAYER' && i._id !== top1?._id);
    const shoes = items.find((i) => i.position === 'SHOES');
    const bottom = items.find((i) => i.position === 'BOTTOM');
    const bag = items.find((i) => i.category === 'BAG');
    const mainAccessory = items.find((i) => i.category === 'CAP' || i.category === 'HAT') ??
      items.find((i) => i.category === 'GLASSES');
    const secondAccessory = items.find((i) => i.category === 'GLASSES' && i._id !== mainAccessory?._id);

    const rightColumnSize = [top1, top2, bag, secondAccessory].filter(Boolean).length;
    const topColumnSize = [mainAccessory, top1, top2, secondAccessory].filter(Boolean).length;

    const top1Position: Position = (() => {
      if (!top2 && topColumnSize > 2)
        return { top: 230, left: 275, maxWidth: 570, maxHeight: 680 }
      if (topColumnSize > 2)
        return { top: 120, left: 340, maxWidth: 570, maxHeight: 680 }
      if (!top2)
        return { top: 90, left: 340, maxWidth: 570, maxHeight: 680 }
      return { top: 25, left: 340, maxWidth: 570, maxHeight: 680 }
    })();

    if (top2)
      composite.push(await positionImage(top1?.image.url, top1Position));

    const bottomPosition: Position = (() => {
      if (top1) {
        if (shoes)
          return { left: 25, top: 175, maxHeight: 865, maxWidth: 440 }
        return { left: 25, top: 175 + 65, maxHeight: 865, maxWidth: 440 }
      }

      if (topColumnSize < 2)
        return { left: 75, top: 130, maxHeight: 865, maxWidth: 440 }
      return { left: 75, top: 175, maxHeight: 865, maxWidth: 440 }
    })();

    composite.push(await positionImage(bottom?.image.url, bottomPosition));
    if (!top2)
      composite.push(await positionImage(top1?.image.url, top1Position));

    const mainAccessoryPosition: Position = (() => {
      if (topColumnSize > 1)
        return { top: 30, left: 30, maxWidth: 290, maxHeight: 270 }
      return { top: 35, left: 340, maxWidth: 290, maxHeight: 270 }
    })();

    composite.push(await positionImage(mainAccessory?.image.url, mainAccessoryPosition));

    const top2Position: Position = (() => {
      if (bag)
        return { top: 400, left: 320, maxWidth: 540, maxHeight: 580 }
      return { top: 550, left: 320, maxWidth: 540, maxHeight: 580 }
    })();

    composite.push(await positionImage(top2?.image.url, top2Position));

    const secondAccessoryPosition: Position = (() => {
      if (rightColumnSize > 3)
        return { top: 705, left: 50, maxWidth: 440, maxHeight: 220 }
      return { top: 50, left: 500, maxWidth: 290, maxHeight: 320 }
    })();

    composite.push(await positionImage(secondAccessory?.image.url, secondAccessoryPosition));

    const bagPosition: Position = (() => {
      if (top1)
        return { top: 560, left: 425, maxWidth: 430, maxHeight: 575 }
      return { top: 345, left: 360, maxWidth: 430, maxHeight: 575 }
    })();

    composite.push(await positionImage(bag?.image.url, bagPosition));

    const shoesPosition: Position = (() => {
      if (rightColumnSize < 3 && (!top2 || !bag))
        return { left: 210, top: 920, maxWidth: 460, maxHeight: 225 }
      if (rightColumnSize <= 2) {
        if (!bag)
          return { top: 920, left: 90, maxWidth: 460, maxHeight: 225 }
      }
      return { top: 920, left: 35, maxWidth: 460, maxHeight: 225 };
    })();

    composite.push(await positionImage(shoes?.image.url, shoesPosition));

    let mainColor = top1?.mainColors[0] ?? top2?.mainColors[0] ?? bottom?.mainColors[0] ?? '#ffffff';
    // make the mainColor a bit lighter to avoid too much contrast with the items
    const mainColorHsl = parseColorToHsl(mainColor) ?? [0, 0, 100];
    mainColor = hslToHex(...getSaturatedHsl(getLighterHsl(mainColorHsl, 65), -45));

    const base = sharp({
      create: {
        width: 880,
        height: 1184,
        channels: 4,
        background: mainColor
      }
    })

    const output = bufferToBase64(await base.composite(composite.filter(notEmpty)).webp().toBuffer());

    const newImage = await ctx.runAction(internal.router.storage.images.uploadMany._internal, {
      userId: outfit.userId,
      images: [{
        base64: addBase64Header(output, 'webp'),
      }]
    });

    if (newImage.length === 0) return false;

    await ctx.runMutation(internal.router.outfits.updateCoverInternal._internal, {
      outfitId,
      newCoverId: newImage[0]._id,
    });

    return true;
  }
})
