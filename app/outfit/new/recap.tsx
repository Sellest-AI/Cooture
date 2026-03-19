import { ROUTES, useRouter } from "@/hooks";
import { useItem } from "@/modules/items/_hooks/useItem";
import { useOutfit } from "@/modules/outfits/_hooks/useOutfit";
import { Button } from "@ui/button";
import { CardItem } from "@ui/cards";
import { FlashList } from "@ui/flat-list";
import { Check, Loader } from "@ui/icons";
import { ModalHeader } from "@ui/modal";
import { SafeAreaView } from "@ui/safe-area-view";
import { router } from "expo-router";
import { useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { Colors } from "theme";
import { itemsAtom } from "./browser";

export default function Screen() {
  const { forceDismissTo } = useRouter();

  const [completed, setCompleted] = useState(false);
  const { setItems, saveOutfit, items } = useOutfit.New();
  const { newItems, pendingItems } = useItem.Create();

  // Reset browser
  const setBrowserItems = useSetAtom(itemsAtom);

  useEffect(() => {
    if (pendingItems.length === 0) return;
    setCompleted(false);
    if (pendingItems.length !== newItems.length) return;
    if (pendingItems.length === newItems.length) {
      setItems((i) => Array.from(new Set([...i, ...newItems.map(i => i._id)])));
      setCompleted(true);
    }
  }, [completed, newItems, newItems.length, pendingItems.length, setItems])

  const displayedItems = useMemo(() => pendingItems.map((item, i) => ({
    _id: item.key,
    image: item.image,
    name: i >= newItems.length ? "Importing..." : "Imported",
    description: '',
  })), [newItems, pendingItems])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          padding: 12,
        }}>
        <ModalHeader
          title="Create an outfit"
          subtitle="Please wait for your items to be imported. This can take some times…"
          onBack={router.canGoBack() ? () => { router.back() } : undefined}
        />
        <FlashList
          data={displayedItems}
          style={{
            marginTop: 16,
            paddingHorizontal: 8,
          }}
          renderItem={({ item, index }) => {
            const marginLeft = 20;
            const marginRight = 20;

            if (!item) return null;

            const isLoading = index >= newItems.length;
            const isCompleted = completed && !isLoading;

            const detailedItem = newItems.find(r => r._id === item._id);

            return (
              <View style={{ marginBottom: 24, paddingTop: 3, marginLeft, marginRight }}>
                <CardItem
                  image={item.image}
                  source={item.image.url}
                  title={detailedItem?.name || item.name}
                  subtitle={detailedItem?.category || item.description}
                  style={{ opacity: isCompleted ? 1 : 0.6 }}
                />
                <View style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <View style={{ marginTop: -24 }}>
                    {isLoading ?
                      <Loader size={24} color={Colors.primary[500]} /> :
                      <Check color={Colors.primary[500]} size={24} />}
                  </View>
                </View>
              </View>
            )
          }}
          numColumns={2}
          masonry
        />
      </ScrollView>
      <View style={{
        padding: 12,
        paddingTop: 0
      }}>
        {items.length === 1 && (
          <Button
            isLoading={!completed}
            variant="primary"
            onPress={async () => {
              setBrowserItems([]);
              const item = items[0];
              forceDismissTo(ROUTES.ITEM.PATH, { pathParams: { id: item } });
            }}
          >
            View Item
          </Button>
        )}
        {items.length > 1 && (
          <Button
            isLoading={!completed}
            variant="primary"
            onPress={async () => {
              const outfit = await saveOutfit();
              setBrowserItems([]);
              forceDismissTo(ROUTES.OUTFIT.PATH, { pathParams: { id: outfit } });
            }}
          >
            Save Outfit
          </Button>
        )}
      </View>
    </SafeAreaView>
  )
}