import {
  Cold,
  Hot,
  Rainy,
  Snowy,
  Sunny,
  Warm,
  Windy,
} from "@ui/icons";
import { ComponentProps } from "react";
import { Categories } from "./categories";
import { Category } from "./category";

type Props = {
  style?: ComponentProps<typeof Category>['style'];
  title: ComponentProps<typeof Category>['title'];
  onPress?: (value: typeof categories[number]['value']) => void;
  disabled?: boolean;
};

const categories = [
  { icon: Cold, value: 'COLD' as const },
  { icon: Warm, value: 'WARM' as const },
  { icon: Hot, value: 'HOT' as const },
  { icon: Rainy, value: 'RAINY' as const },
  { icon: Snowy, value: 'SNOWY' as const },
  { icon: Sunny, value: 'SUNNY' as const },
  { icon: Windy, value: 'WINDY' as const },
];

export const WeatherCategory = ({ title, ...props }: Props) => {
  return (
    <Categories
      {...props}
      categories={categories}
      value={title}
      categoryTitle="Weather"
    />
  )
}