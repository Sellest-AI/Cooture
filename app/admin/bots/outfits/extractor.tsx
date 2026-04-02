import { ROUTES, useRoute } from "@/hooks";
import { api } from "@/lib/convex/api";
import { useAction, useMutation, usePaginatedQuery } from "@/lib/convex/client";
import { compressImage } from "@/lib/image/client/editing";
import { BrowserItemsList } from "@/modules/outfits/browser/browser.items-list";
import { Browser, BrowserProductData, BrowserProductItem } from "@/modules/outfits/browser/browser.view";
import { Button } from "@ui/button";
import { ArrowRight, Check, Loader, TShirt } from "@ui/icons";
import { prefetch } from "@ui/image";
import { SafeAreaView } from "@ui/safe-area-view";
import { router } from "expo-router";
import { atom, useAtom } from "jotai";
import { nanoid } from "nanoid/non-secure";
import { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";

type Item = Omit<BrowserProductItem, 'images'> & { images: (BrowserProductItem['images'][number] & { selected: boolean })[] };

const savingAtom = atom(false);
const Save = ({ items }: { items: Item[] }) => {
  const { userId } = useRoute(ROUTES.ADMIN.BOTS.OUTFITS.EXTRACTOR);

  const { action: removeBackground } = useAction(api.llm.triggers.removeBackground.admin);
  const { mutate: createOutfit } = useMutation(api.router.outfits.createOne.admin);

  const [startedAt, setStartedAt] = useState<number>();
  const [completed, setCompleted] = useState(false);
  const [isSaving, setSaving] = useAtom(savingAtom);
  const [pendingItems, setPendingItems] = useState<Item[]>([]);
  const { results } = usePaginatedQuery(api.router.items.getPaginated.admin, userId ? { userId } : 'skip', { initialNumItems: 8 });
  const newItems = useMemo(() => startedAt ? results.filter((i) => i._creationTime > startedAt) : [], [startedAt, results]);

  useEffect(() => {
    if (pendingItems.length === 0) return;
    setSaving(true);
    if (pendingItems.length !== newItems.length) return;
    if (pendingItems.length === newItems.length) { setSaving(false); setCompleted(true); }
  }, [newItems.length, pendingItems.length, setSaving])

  const saveItem = async (item: Item) => {
    if (!userId) return;
    const image = item.images.find(i => i.selected) ?? item.images[0];
    const compressed = await compressImage(image.url, { maxResolution: 2048, keepMimeType: false });
    const base64 = await compressed.toBase64();
    await removeBackground({
      userId,
      base64: base64,
      nextStep: 'CREATE_ITEM',
      nextArgs: {
        CREATE_ITEM: {
          brand: item.brand,
          name: item.title,
          description: item.description,
          itemUrl: item.url,
        }
      }
    });
  }

  const handleSave = async () => {
    if (!userId) return;
    if (isSaving) return;

    setSaving(true);

    // If already completed, do nothing
    if (completed) {
      await createOutfit({ userId, items: newItems.map((i) => i._id) });
      setSaving(false);
      if (router.canGoBack()) router.back();
      return;
    }

    setStartedAt(Date.now());
    setPendingItems(items);
    for (const item of items) {
      await saveItem(item).catch(() => null);
    }
  }

  const Icon = completed ? Check : (isSaving ? Loader : ArrowRight);
  const extend = (isSaving || completed) ? true : false;

  return (
    <Button
      variant="primary"
      size={extend ? undefined : "rounded"}
      style={{ flex: extend ? 1 : undefined }}
      disabled={items.length === 0 || isSaving}
      startIcon={Icon}
      onPress={() => handleSave()}
    />
  )
}

export default function Screen() {
  const [isSaving] = useAtom(savingAtom);
  const [items, setItems] = useState<Item[]>([]);
  const [showList, setShowList] = useState(false);

  const listen = useRef(false);
  const extractProductRef = useRef<(callback?: (data: BrowserProductData) => void) => void>(() => { });

  const handleProductExtracted = (data: BrowserProductData) => {
    const items = data.items?.filter((i) => i.images.length > 0);
    items?.map((i) => i.images).flat().forEach((img) => { prefetch(img.url) });

    const newItems = (items ?? []).map((item) => ({
      key: nanoid(),
      url: item.url,
      title: item.title,
      description: item.description,
      images: item.images.map((img, i) => ({ ...img, selected: i === 0 })),
    }))

    if (listen.current) {
      listen.current = false;
      setItems(p => [...p, ...newItems]);
      setShowList(true);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={{ bottom: 'android' }}>
      <Browser.Provider>
        <Browser
          autoExtractDelay={1000}
          onProductExtracted={handleProductExtracted}
          extractProductRef={extractProductRef}
          onTouchStart={() => setShowList(false)}
        >
          <BrowserItemsList
            items={items}
            onClose={() => setShowList(false)}
            isOpen={showList}
            onRemoveItem={(id) => {
              setItems(p => {
                const updated = p.filter(i => i.key !== id);
                if (updated.length === 0) setShowList(false);
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
          <View style={{ paddingTop: 8, paddingHorizontal: 12, paddingBottom: 0, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            {!isSaving && <>
              <Button
                variant="blur"
                size="rounded"
                onPress={() => setShowList((v) => !v)}
                startIcon={TShirt}
              />
              <Button
                style={{ flex: 1 }}
                align="stretch"
                variant="blur"
                onPress={() => {
                  listen.current = true;
                  extractProductRef.current?.(handleProductExtracted);
                }}>
                Extract Outfit
              </Button>
            </>}
            <Save items={items} />
          </View>
        </Browser>
      </Browser.Provider>
    </SafeAreaView>
  )
}