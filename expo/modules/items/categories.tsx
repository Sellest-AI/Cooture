import { Modal } from "@ui/modal";
import { useState } from "react";
import { FlatList, View } from "react-native";
import { Category } from "./category";

type Props<T extends string> = {
  value: string;
  categories: { icon: React.ComponentProps<typeof Category>['icon']; value: T }[];
  style?: React.ComponentProps<typeof Category>['style'];
  categoryTitle: string;
  onPress?: (value: T) => void;
}

export const Categories = <T extends string>({ value, categories, categoryTitle, onPress, ...props }: Props<T>) => {
  const [open, setOpen] = useState(false);

  const Icon = categories.find(i => i.value === value)?.icon || categories[0].icon;

  return (
    <>
      <Category
        {...props}
        icon={Icon}
        title={value}
        onPress={() => setOpen(true)}
      />
      <Modal
        onOpenChange={setOpen}
        scrollable={false}
        open={open}
        style={{ maxHeight: '80%' }}
        header={{ title: categoryTitle }}
      >
        <FlatList
          showsVerticalScrollIndicator={false}
          data={categories}
          numColumns={2}
          keyExtractor={(i) => i.value}
          contentContainerStyle={{ paddingTop: 12 }}
          renderItem={({ item }) => (
            <View style={{ padding: 2, flex: 1 }}>
              <Category
                title={item.value}
                icon={item.icon}
                selected={item.value === value}
                onPress={() => onPress?.(item.value)}
              />
            </View>
          )}
        />
      </Modal>
    </>
  )
}