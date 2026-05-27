import { Doc } from "../../_generated/dataModel";
import { extractPosition } from "./extractPosition";
import { sanitizePrice } from "./sanitizePrice";

type Item = Doc<'items'>;

export const sanitizeItem = <T extends Item>(item: T) => {
  return {
    ...item,
    position: extractPosition(item.category),
    price: sanitizePrice(item),
  }
}