import { Female, Male, Unisex } from "@ui/icons";
import { ComponentProps } from "react";
import { Categories } from "./categories";
import { Category } from "./category";

type Props = {
  style?: ComponentProps<typeof Category>['style'];
  title: ComponentProps<typeof Category>['title'];
  onPress?: (value: typeof categories[number]['value']) => void;
};

const categories = [
  { icon: Male, value: 'MALE' as const },
  { icon: Female, value: 'FEMALE' as const },
  { icon: Unisex, value: 'UNISEX' as const },
];

export const GenderCategory = ({ title, ...props }: Props) => {
  return (
    <Categories
      {...props}
      categories={categories}
      value={title}
      categoryTitle="Gender"
    />
  )
}