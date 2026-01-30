import {
  Colorful,
  Dark,
  Light,
  Neutral,
} from "@ui/icons";
import { ComponentProps } from "react";
import { Categories } from "./categories";
import { Category } from "./category";

type Props = {
  style?: ComponentProps<typeof Category>['style'];
  title: ComponentProps<typeof Category>['title'];
  onPress?: (value: typeof categories[number]['value']) => void;
};

const categories = [
  { icon: Light, value: 'LIGHT' as const },
  { icon: Dark, value: 'DARK' as const },
  { icon: Neutral, value: 'NEUTRAL' as const },
  { icon: Colorful, value: 'COLORFUL' as const },
];

export const ColorCategory = ({ title, ...props }: Props) => {
  return (
    <Categories
      {...props}
      categories={categories}
      value={title}
      categoryTitle="Color"
    />
  )
}