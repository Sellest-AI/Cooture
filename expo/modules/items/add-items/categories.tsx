import { Block } from "@ui/block";
import { BlurKeys } from "@ui/blur-view";
import { FlashList } from "@ui/flat-list";
import { Pressable } from "@ui/pressable";
import { Text } from "@ui/text";
import { ReactNode, useEffect, useState } from "react";
import { View, ViewStyle } from "react-native";
import { Colors } from "theme";

const categories = [
  "ALL",
  "SHOES",
  "ACCESSORY",
  "OUTERWEAR",
  "BOTTOM",
  "TOP",
  "JEANS",
  "JACKET",
  "DRESS",
  "HOODIE",
  "SWEATER",
  "TSHIRT",
  "SKIRT",
  "HAT",
  "CAP",
  "LEGWEAR",
  "GLASSES",
  "BAG",
]

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

type Props = {
  style?: ViewStyle;
  category?: string | null;
  onCategoryChange?: (category: string | null) => void;
  extraCategories?: Record<string, ReactNode | string>;
}

export const Categories = ({ style, category: _category, extraCategories, onCategoryChange }: Props) => {
  const [category, setCategory] = useState<string | null>(_category ?? null);
  useEffect(() => { setCategory(_category ?? null); }, [_category]);

  const extraCategoriesKeys = extraCategories ? Object.keys(extraCategories) : [];

  return (
    <FlashList
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        minHeight: 34,
        ...style,
      }}
      data={[...extraCategoriesKeys, ...categories]}
      keyExtractor={(item) => item}
      renderItem={({ item, index }) => {
        const isSelected = category === item || (item === 'ALL' && category === null);

        if (extraCategories && extraCategoriesKeys.includes(item)) {
          return (
            <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              {typeof extraCategories[item] === 'string' ? (
                <Text.Base weight={500} color={Colors.neutral[200]}>
                  {extraCategories[item]}
                </Text.Base>
              ) : (
                extraCategories[item]
              )}
            </View>
          )
        }

        return (
          <Pressable
            onPress={() => {
              setCategory((c) => {
                let value: typeof item | null = item;
                if (item === 'ALL' || c === item) value = null;
                onCategoryChange?.(value);
                return value;
              });
            }}
          >
            <Block
              blurKey={BlurKeys.PHOOTSHOOT_PRESETS_ITEMS}
              variant={isSelected ? 'primary' : 'blur'}
              style={{
                padding: 8,
                paddingHorizontal: 16,
                marginRight: (categories?.length ?? 0) - 1 === index ? 0 : 8,
                borderRadius: 99,
              }}
            >
              <Text.Base weight={500} color={isSelected ? Colors.primary[900] : Colors.neutral[200]}>
                {capitalizeFirstLetter(item)}
              </Text.Base>
            </Block>
          </Pressable>
        )
      }}
    />
  )
}