import { ITEM_CATEGORIES } from "../../schema/items";

export type Position = 'TOP' | 'BOTTOM' | 'LEGWEAR' | 'UNDERWEAR' | 'INNERLAYER' | 'OUTERWEAR' | 'ACCESSORY' | 'SHOES';
type Category = typeof ITEM_CATEGORIES['type'];
export const extractPosition = (category: Category): Position => {
  switch (category) {
    case "TOP":
      return 'TOP';
    case "BOTTOM":
      return 'BOTTOM';
    case "LEGWEAR":
      return 'LEGWEAR';
    case "DRESS":
      return 'TOP';
    case "OUTERWEAR":
      return 'OUTERWEAR';
    case "JACKET":
      return 'OUTERWEAR';
    case "SHOES":
      return 'SHOES';
    case "ACCESSORY":
      return 'ACCESSORY';
    case "HOODIE":
      return 'OUTERWEAR';
    case "SWEATER":
      return 'TOP';
    case "TSHIRT":
      return 'INNERLAYER';
    case "JEANS":
      return 'BOTTOM';
    case "SKIRT":
      return 'BOTTOM';
    case "HAT":
      return 'ACCESSORY';
    case "CAP":
      return 'ACCESSORY';
    case "GLASSES":
      return 'ACCESSORY';
    case "BAG":
      return 'ACCESSORY';
  }
}