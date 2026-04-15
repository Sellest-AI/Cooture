import { api, useQueryCached } from "@/lib/convex/client";
import { useItem } from "@/modules/items/_hooks/useItem";
import { Browser, BrowserProductData } from "@/modules/outfits/browser/browser.view";
import { Loader } from "@ui/icons";
import { SafeAreaView } from "@ui/safe-area-view";
import { useToasts } from "@ui/toast";
import { router } from "expo-router";
import { nanoid } from "nanoid/non-secure";
import { View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function Screen() {
  const { create } = useItem.Create();
  const { addToast } = useToasts();

  const { data: cost } = useQueryCached(api.router.credits.getCost.anon, { type: 'ITEM_CREATION_COST' });
  const { data: canPay } = useQueryCached(api.router.credits.canPay.authed, cost ? { amount: cost } : 'skip');

  const handleProductExtracted = async (data: BrowserProductData) => {
    if (!canPay) {
      router.push(ROUTES.MODALS.UPGRADE)
      return;
    }

    const items = data.items?.filter((i) => i.images.length > 0);

    const newItems = (items ?? []).map((item) => ({
      key: nanoid(),
      url: item.url,
      brand: item.brand,
      title: item.title,
      description: item.description,
      images: item.images.map((img, i) => ({ ...img, selected: i === 0 })),
    }))

    const item = newItems[0];
    const img = item.images.filter(i => i.uri ?? i.url)[0];
    const image = { url: (img.url ?? img.uri)!, width: img.width, height: img.height };
    if (!image.url) return;

    addToast({
      title: 'Extracting product information',
      description: 'This can take up to a minute. You can now close the browser.',
      icon: Loader,
      type: 'success',
      durationS: 10,
    });

    await create({
      key: item.key,
      url: item.url,
      name: item.title,
      brand: item.brand,
      description: item.description,
      image: image,
      createdAt: Date.now(),
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, gap: 8 }} edges={{ bottom: 'android' }}>
      <View style={{ flex: 1 }}>
        <Browser.Provider>
          <Browser onProductExtracted={handleProductExtracted} />
        </Browser.Provider>
      </View>
    </SafeAreaView>
  )
}