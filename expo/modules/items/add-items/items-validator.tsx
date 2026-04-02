import { api, Id } from "@/lib/convex/api";
import { useQuery } from "@/lib/convex/client";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { ArrowRight, ChevronDown, X } from "@ui/icons";
import { Image } from "@ui/image";
import { AnimatePresence, MotiView } from "@ui/motion";
import { Pressable } from "@ui/pressable";
import { Text } from "@ui/text";
import { ScrollView, View } from "react-native";
import { Colors } from "theme";

const ITEM_HEIGHT = 76;

type Props = {
  onPress?: (items: Id<'items'>[]) => void;
  items: Id<'items'>[];
  onItemRemoved?: (item: Id<'items'>) => void;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

export const ItemsValidator = ({ onPress, items, onItemRemoved, disabled, onOpenChange, open = true }: Props) => {
  const isOpen = open && items.length > 0;

  return (
    <MotiView
      animate={{
        transform: [{
          translateY:
            items.length > 0 ? 0 : ITEM_HEIGHT + 58 + 24
        }],
      }}
      transition={{ delay: items.length > 0 ? 100 : 200 }}
    >
      <Block
        variant="blur"
        blurIntensity={64}
        style={{
          paddingBottom: 12,
          borderRadius: isOpen ? 28 : 24,
        }}
      >
        <MotiView
          style={{
            justifyContent: 'flex-end',
          }}
          animate={{
            height: isOpen ? ITEM_HEIGHT + 58 + 24 : 58,
          }}
          transition={{
            type: 'timing',
            duration: 300,
          }}
        >
          <View style={{
            height: ITEM_HEIGHT,
            marginBottom: 16,
          }}>
            <ScrollView
              directionalLockEnabled={true}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12 }}
            >
              <AnimatePresence>
                {items.map((itemId) => (
                  <MotiView
                    key={itemId.toString()}
                    from={{ maxWidth: 0 }}
                    animate={{ maxWidth: 112 }}
                    style={{ marginRight: 24 }}
                  >
                    <Item
                      id={itemId}
                      onDelete={() => onItemRemoved?.(itemId)}
                    />
                  </MotiView>
                ))}
              </AnimatePresence>
            </ScrollView>
          </View>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: "center",
            paddingHorizontal: 12,
          }}>
            <Pressable
              onPress={() => { onOpenChange?.(!isOpen) }}
              style={{
                gap: 10,
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 8,
                marginLeft: 8,
                flex: 1,
              }}>
              <Text.Base color={Colors.neutral[400]} weight={500}>{items.length} selected</Text.Base>
              <MotiView animate={{
                transform: [{ rotate: isOpen ? '0deg' : '180deg' }]
              }}>
                <ChevronDown color={Colors.neutral[200]} size={20} />
              </MotiView>
            </Pressable>
            <Button
              variant="primary"
              size="sm"
              endIcon={ArrowRight}
              disabled={disabled}
              onPress={() => onPress?.(items)}
            >
              Next
            </Button>
          </View>
        </MotiView>
      </Block>
    </MotiView>
  )
}

const Item = ({ id, style, onDelete }: { id: Id<'items'>, style?: { marginRight?: number }, onDelete: () => void }) => {
  const { data: item } = useQuery(api.router.items.getOne.anon, { itemId: id });

  const width = ITEM_HEIGHT * (item ? (item.image.width / item.image.height) : 1);

  return (
    <Pressable>
      <Image
        source={item?.image.sizes.small.url}
        contentFit="contain"
        style={{
          height: ITEM_HEIGHT,
          maxWidth: '100%',
          minWidth: 72,
          width: width,
          ...style,
        }}
      />
      <Pressable
        intensity={0}
        onPress={onDelete}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
        }}
      >
        <Block variant="blur"
          style={{
            padding: 8,
            borderRadius: 99,
          }}
        >
          <X color={Colors.neutral[400]} size={16} />
        </Block>
      </Pressable>
    </Pressable>
  )
}