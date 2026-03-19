import {
  Accessory,
  Bag,
  Bottom,
  Cap,
  DressIcon,
  Glasses,
  Hat,
  HoodieIcon,
  Jacket,
  Jeans,
  Outerwear,
  Shoes,
  Skirt,
  Sweater,
  Top,
  TShirt,
} from "@ui/icons";
import { ComponentProps } from "react";
import { Categories } from "./categories";
import { Category } from "./category";

const categories = [
  { icon: Top, value: 'TOP' as const },
  { icon: Bottom, value: 'BOTTOM' as const },
  { icon: DressIcon, value: 'DRESS' as const },
  { icon: Outerwear, value: 'OUTERWEAR' as const },
  { icon: Jacket, value: 'JACKET' as const },
  { icon: Shoes, value: 'SHOES' as const },
  { icon: Accessory, value: 'ACCESSORY' as const },
  { icon: HoodieIcon, value: 'HOODIE' as const },
  { icon: Sweater, value: 'SWEATER' as const },
  { icon: TShirt, value: 'TSHIRT' as const },
  { icon: Jeans, value: 'JEANS' as const },
  { icon: Skirt, value: 'SKIRT' as const },
  { icon: Hat, value: 'HAT' as const },
  { icon: Cap, value: 'CAP' as const },
  { icon: Glasses, value: 'GLASSES' as const },
  { icon: Bag, value: 'BAG' as const },
];

type Props = {
  style?: ComponentProps<typeof Category>['style'];
  title: ComponentProps<typeof Category>['title'];
  onPress?: (value: typeof categories[number]['value']) => void;
  disabled?: boolean;
};

export const ItemCategory = ({ title, ...props }: Props) => {
  return (
    <Categories
      {...props}
      categories={categories}
      value={title}
      categoryTitle="Category"
    />
  )
}