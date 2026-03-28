import { useAccount } from "@/lib/convex/auth";
import { api, useQueryCached } from "@/lib/convex/client";
import { useItem } from "@/modules/items/_hooks/useItem";
import { BrowserItemsList } from "@/modules/outfits/browser/browser.items-list";
import { Browser, BrowserProductData, BrowserProductItem } from "@/modules/outfits/browser/browser.view";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { ArrowRight, Check, Plus, TShirt, X } from "@ui/icons";
import { Image, prefetch } from "@ui/image";
import { AnimatePresence, MotiView } from "@ui/motion";
import { Pressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { nanoid } from "nanoid/non-secure";
import { useRef, useState } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Colors } from "theme";

type RoundedButtonProps = {
  badgeCount?: number;
  style?: ViewStyle;
  icon?: React.ComponentType<{ size?: number, color?: string, style?: ViewStyle }> | false;
  onPress?: () => void;
  variant?: "primary" | "blur" | "secondary";
}

const RoundedButton = ({ onPress, style, badgeCount, icon: Icon, variant = "blur" }: RoundedButtonProps) => {
  const { padding = 10, ...restStyle } = style || {};
  return (
    <Pressable style={restStyle} onPress={onPress}>
      <Block variant={variant} style={{
        borderRadius: 99,
        padding: padding,
      }}>
        {Icon && <Icon size={24} color={Colors.foreground} />}
      </Block>
      {(badgeCount && badgeCount > 0) ? <Block variant="destructive" style={styles.badge}>
        <Text.Sm color={Colors.destructive[50]} weight={700} style={{ marginLeft: -1, marginTop: -1 }}>
          {badgeCount}
        </Text.Sm>
      </Block> : undefined}
    </Pressable>
  )
}

type Item = Omit<BrowserProductItem, 'images'> & { images: (BrowserProductItem['images'][number] & { selected: boolean })[] };
export const itemsAtom = atom<Item[]>([]);

const showItemsAtom = atom(false);
const OutfitsButton = ({ style }: { style?: ViewStyle }) => {
  const items = useAtomValue(itemsAtom);
  const [opened, setOpened] = useAtom(showItemsAtom);

  if (items.length === 0) return null;

  return (
    <>
      <MotiView
        from={{ width: 0, translateX: -52 }}
        animate={{ width: 56, translateX: 0 }}
        transition={{ delay: 100 }}
      >
        <RoundedButton
          onPress={() => { setOpened((p) => !p); }}
          style={{ padding: 14, ...style }}
          icon={opened ? X : TShirt}
          badgeCount={items.length}
        />
      </MotiView>
    </>
  )
}

const OutfitItems = () => {
  const [items, setItems] = useAtom(itemsAtom);
  const [opened, setOpened] = useAtom(showItemsAtom);

  return (
    <BrowserItemsList
      items={items}
      onClose={() => setOpened(false)}
      isOpen={opened}
      onRemoveItem={(id) => {
        setItems(p => {
          const updated = p.filter(i => i.key !== id);
          if (updated.length === 0) setOpened(false);
          return updated;
        });
      }}
      onSelectImage={(item) => {
        setItems(p => {
          const index = p.findIndex(i => i.key === item.id);
          if (index === -1) return p;
          const image = p[index].images.find(img => img.url === item.url);
          if (!image) return p;
          const newItem = {
            ...p[index],
            images: p[index].images.map(i => ({ ...i, selected: i.url === image.url }))
          };
          const newPending = [...p];
          newPending[index] = newItem;
          return newPending;
        })
      }}
    />
  )
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: 2,
    right: -4,
    borderRadius: 99,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  }
})

export default function Screen() {
  const setShowList = useSetAtom(showItemsAtom);
  const [added, setAdded] = useState(false);
  const listen = useRef(false);

  const extractProductRef = useRef<(callback?: (data: BrowserProductData) => void) => void>(() => { });
  const [item, setItem] = useState<BrowserProductItem | null>(null);
  const [items, setItems] = useAtom(itemsAtom);

  const [loading, setLoading] = useState(false);
  const { create } = useItem.Create();

  const handleProductExtracted = (data: BrowserProductData) => {
    const items = data.items?.filter((i) => i.images.length > 0);
    setItem(items?.[0] ?? null);

    items?.map((i) => i.images).flat().forEach((img) => { prefetch(img.url) });

    const newItems = (items ?? []).map((item) => ({
      key: nanoid(),
      url: item.url,
      brand: item.brand,
      title: item.title,
      description: item.description,
      images: item.images.map((img, i) => ({ ...img, selected: i === 0 })),
    }))

    if (listen.current) {
      listen.current = false;
      setAdded(true);
      setItems(p => [...p, ...newItems]);
      setTimeout(() => { setAdded(false); }, 1200);
    }
  };

  const itemImage = item?.images?.[0];

  const { wallet } = useAccount.Wallet();
  const { data: cost } = useQueryCached(api.router.credits.getCost.anon, { type: 'IMAGE_GENERATION_COST', amount: items.length + 1 });
  const canPay = wallet ? cost !== undefined && wallet.credits >= cost : false;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, gap: 8 }} edges={{ bottom: 'android' }}>
      <View style={{ flex: 1 }}>
        <Browser.Provider>
          <Browser
            autoExtractDelay={1000}
            onProductExtracted={handleProductExtracted}
            extractProductRef={extractProductRef}
            onTouchStart={() => setShowList(false)}
          >
            <AnimatePresence>
              {!loading && <OutfitItems key={"outfits"} />}
              <MotiView
                from={{ opacity: 0, scale: 0.8, height: 0 }}
                animate={{ opacity: 1, scale: 1, height: 56 + 8 }}
                exit={{ opacity: 0, scale: 0.95, height: 0, translateY: -24 }}
                exitTransition={{ delay: 0 }}
                transition={{ delay: 500 }}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  width: '100%',
                  gap: 8,
                  paddingTop: 8,
                  paddingHorizontal: 8,
                }}>
                <OutfitsButton />
                <Button
                  variant="blur"
                  startIcon={added ? Check : (itemImage ? undefined : Plus)}
                  disabled={items.length > 5 || loading || !canPay}
                  startContent={added ? undefined : (itemImage ? <Image
                    style={{ width: 24, height: 24, borderRadius: 8 }}
                    source={itemImage.url}
                    contentFit="cover"
                  /> : undefined)}
                  onPress={async () => {
                    if (added) return;
                    listen.current = true;
                    extractProductRef.current();
                  }}
                  style={{ flex: 1 }}
                >
                  {added ? "Added" : "Add to outfit"}
                </Button>
                <Button
                  disabled={items.length === 0}
                  onPress={async () => {
                    setLoading(true);
                    for await (const item of items) {
                      await create({
                        key: item.key,
                        url: item.url,
                        name: item.title,
                        brand: item.brand,
                        description: item.description,
                        image: item.images.find(i => i.selected) || item.images[0],
                        createdAt: Date.now(),
                      })
                    }
                    setLoading(false);
                    router.push('/outfit/new/recap');
                  }}
                  size="rounded"
                  variant="primary"
                  startIcon={ArrowRight}
                  style={{ padding: 6 }}
                />
              </MotiView>
            </AnimatePresence>
          </Browser>
        </Browser.Provider>
      </View>
    </SafeAreaView>
  )
}