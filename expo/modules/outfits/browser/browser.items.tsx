import { Button } from "@ui/button";
import { ArrowRight, Check, X } from "@ui/icons";
import { Image } from "@ui/image";
import { Pressable } from "@ui/pressable";
import { Text } from "@ui/text";
import { AnimatePresence, MotiView } from "moti";
import { FlatList, ScrollView, View, ViewStyle } from "react-native";
import { Colors } from "theme";

type Item = {
  id: string;
  title: string;
  description: string;
  images: { url: string, width: number, height: number, selected?: boolean }[];
}

type Props = {
  items: Item[];
  style?: ViewStyle;
  onNavigateToItem?: (id: string) => void;
  onRemoveItem?: (id: string) => void;
  onSelectImage?: (item: { id: string, url: string }) => void;
  onDone?: () => void;
}

export const BrowserItems = ({ items, style, onRemoveItem, onSelectImage, onNavigateToItem, onDone }: Props) => {
  return (
    <ScrollView
      contentContainerStyle={style}
      showsVerticalScrollIndicator={false}
    >
      <Text.H4 color={Colors.neutral[50]} weight={700} style={{ marginBottom: 12 }}>
        Items
      </Text.H4>
      <AnimatePresence>
        {items.map((item, i) => {
          return (
            <MotiView
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: 150 * (i + 1) }}
              exit={{ opacity: 0, translateX: 20 }}
              exitTransition={{ duration: 200 }}
              key={item.id}
              style={{
                opacity: 1,
                flexDirection: 'row',
                gap: 16,
                marginBottom: i < items.length - 1 ? 12 : 0,
              }}
            >
              <FlatList
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
                style={{ borderRadius: 8, maxWidth: '53%' }}
                data={item.images.sort((a, b) => b.width - a.width)}
                horizontal
                keyExtractor={(img) => img.url}
                renderItem={({ item: img }) => (
                  <Pressable
                    onPress={() => onSelectImage?.({ id: item.id, url: img.url })}
                    key={img.url}
                    style={{ width: 68 }}
                  >
                    <Image
                      source={img.url}
                      style={{
                        width: '100%',
                        aspectRatio: 3 / 4,
                        borderRadius: 8,
                        padding: img.selected ? 2 : 0,
                        paddingBottom: img.selected ? 3 : 0,
                        backgroundColor: img.selected ? Colors.primary[500] : Colors.blur.dark
                      }}
                    />
                    {img.selected && <Check
                      style={{ alignSelf: 'center', marginTop: 6 }}
                      color={Colors.primary[500]}
                      size={12}
                    />}
                    {!img.selected && <Text.Sm
                      style={{ fontSize: 12, lineHeight: 12, marginTop: 6, textAlign: 'center' }}
                      color={Colors.neutral[400]}
                    >
                      {Math.max(img.width, img.height)}px
                    </Text.Sm>}
                  </Pressable>
                )}
              />
              <View style={{ flex: 1, flexShrink: 1 }}>
                <Pressable onPress={() => onNavigateToItem?.(item.id)}>
                  <Text.Base
                    color={Colors.neutral[50]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text.Base>
                </Pressable>
                <Text.Sm
                  style={{ marginTop: 4 }}
                  color={Colors.neutral[400]}
                  numberOfLines={2}
                >
                  {item.description}
                </Text.Sm>
                <Pressable
                  onPress={() => onRemoveItem?.(item.id)}
                  style={{
                    alignSelf: 'flex-end',
                    width: 'auto',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 99,
                    backgroundColor: Colors.blur.dark,
                    borderColor: Colors.blur.medium,
                    borderWidth: 1,
                  }}
                >
                  <X color={Colors.neutral[50]} size={16} />
                  <Text.Sm color={Colors.neutral[50]}>Remove</Text.Sm>
                </Pressable>
              </View>
            </MotiView>
          )
        })}
      </AnimatePresence>
      {onDone && <Button
        variant="primary"
        style={{ marginTop: 16 }}
        onPress={onDone}
        endIcon={ArrowRight}
      >
        Generate my outfit
      </Button>}
    </ScrollView>
  )
}