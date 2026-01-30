import { Firm, Medium, Rigid, Soft } from "@ui/icons";
import { ComponentProps } from "react";
import { Categories } from "./categories";
import { Category } from "./category";
type Props = {
  style?: ComponentProps<typeof Category>['style'];
  title: ComponentProps<typeof Category>['title'];
  onPress?: (value: typeof categories[number]['value']) => void;
};

const categories = [
  { icon: Soft, value: 'SOFT' as const },
  { icon: Medium, value: 'MEDIUM' as const },
  { icon: Firm, value: 'FIRM' as const },
  { icon: Rigid, value: 'RIGID' as const },
];

export const FeelCategory = ({ title, ...props }: Props) => {
  return (
    <Categories
      {...props}
      categories={categories}
      value={title}
      categoryTitle="Feel"
    />
  )
}