import { useItem } from "@/modules/items/_hooks/useItem";
import { Browser } from "@/modules/outfits/browser/browser.view";
import { LoadingBlock } from "@ui/block.loading";
import { Button } from "@ui/button";
import { FlashList } from "@ui/flat-list";
import { Loader } from "@ui/icons";
import { Image } from "@ui/image";
import { ModalHeader } from "@ui/modal";
import { Pressable } from "@ui/pressable";
import { useToasts } from "@ui/toast";
import { Redirect, router } from "expo-router";
import { useShareIntentContext } from "expo-share-intent";
import { nanoid } from "nanoid/non-secure";
import React, { useState } from "react";
import { View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

const useShareIntent = () => {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();

  let sourceUrl = shareIntent.webUrl;
  if (!sourceUrl && shareIntent.text) {
    const urlMatch = shareIntent.text.match(/(https?:\/\/[^\s]+)/);
    sourceUrl = urlMatch ? urlMatch[0] : shareIntent.text;
  }

  const imageFiles = shareIntent.files || [];

  return {
    imageFiles,
    sourceUrl,
    hasShareIntent,
    resetShareIntent,
  }
}

type SharedProps = {
  onGoBack: () => void;
}

const ExtractItemBrowser = ({ onGoBack }: SharedProps) => {
  const { sourceUrl, resetShareIntent } = useShareIntent();
  const { create } = useItem.Create();
  const { addToast } = useToasts();

  const [item, setItem] = useState<{
    url: string;
    name: string;
    brand: string;
    description: string;
    images: { url: string, selected: boolean, width: number, height: number }[];
  } | null>(null);

  const imageSelected = item?.images.find(i => i.selected);

  return (
    <View style={{ flex: 1 }}>
      <ModalHeader
        customBackIcon="x"
        title="Import item"
        subtitle={item ?
          "Select the image of your product" : "Extracting information..."}
        onBack={onGoBack}
      />
      {sourceUrl && <View style={{ opacity: 0 }}><Browser
        defaultUrl={sourceUrl}
        autoExtractDelay={500}
        onProductExtracted={(data) => {
          const item = data.items?.[0];
          if (!item) return;

          setItem({
            url: sourceUrl,
            name: item.title,
            brand: item.brand ?? '',
            description: item.description ?? '',
            images: item.images
              .map((data) => ({ ...data, url: data.url!, selected: false }))
          })
        }}
      /></View>}
      {!item && <View style={{ height: 512 }}><LoadingBlock type="logo" /></View>}
      {item && <FlashList
        data={item?.images.toReversed()}
        numColumns={2}
        keyExtractor={(item) => item.url}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              setItem((_item) => _item ? {
                ..._item,
                images: _item.images.map((i) =>
                  i.url === item.url ? { ...i, selected: !i.selected } : { ...i, selected: false })
              } : null);
            }}
            style={{
              flex: 1,
              padding: 4,
            }}
          >
            <View style={{
              backgroundColor: item.selected ? Colors.primary[500] : undefined,
              borderWidth: item.selected ? 4 : 4,
              borderColor: item.selected ? Colors.primary[500] : 'transparent',
              borderRadius: 12,
            }}>
              <Image
                source={item.url}
                contentFit="cover"
                style={{
                  flex: 1,
                  width: '100%',
                  aspectRatio: 3 / 4,
                  borderRadius: 12,
                  opacity: item.selected ? 0.8 : 1,
                }}
              />
            </View>
          </Pressable>
        )}
      />}
      {(imageSelected && item) && <Button
        variant="primary"
        onPress={async () => {
          router.dismissTo(ROUTES.OUTFIT.NEW);

          resetShareIntent();

          requestAnimationFrame(() => {
            addToast({
              title: 'Extracting product information',
              description: 'This can take up to a minute.',
              icon: Loader,
              type: 'success',
              durationS: 10,
            });

            create({
              url: item.url,
              brand: item.brand,
              description: item.description,
              name: item.name,
              image: imageSelected,
              key: nanoid(),
              createdAt: Date.now()
            }).catch(() => null)
          });
        }}
      >
        Import item
      </Button>}
    </View>
  )
}

const ExtractItemFile = ({ onGoBack }: SharedProps) => {
  const { imageFiles, resetShareIntent } = useShareIntent();
  const { create } = useItem.Create();
  const { addToast } = useToasts();

  return (
    <View style={{ flex: 1 }}>
      <ModalHeader
        customBackIcon="x"
        title={`Import item${imageFiles.length > 1 ? 's' : ''}`}
        onBack={onGoBack}
      />
      <FlashList
        data={imageFiles}
        numColumns={1}
        keyExtractor={(item) => item.path}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <View style={{
            padding: 8
          }}>
            <Image
              source={{ uri: item.path }}
              contentFit="cover"
              style={{
                width: '100%',
                aspectRatio: 3 / 4,
                borderRadius: 12,
              }}
            />
          </View>
        )}
      />
      <Button
        variant="primary"
        onPress={async () => {
          for (const imageFile of imageFiles) {
            if (!imageFile.path) continue;
            if (!imageFile.width || !imageFile.height) continue;

            await create({
              url: undefined,
              brand: undefined,
              description: undefined,
              name: undefined,
              image: { url: imageFile.path, width: imageFile.width, height: imageFile.height },
              key: nanoid(),
              createdAt: Date.now()
            }).catch(() => null)

            addToast({
              title: 'Extracting product information',
              description: 'This can take up to a minute.',
              icon: Loader,
              type: 'success',
              durationS: 10,
            });
          }

          resetShareIntent();
          router.dismissTo(ROUTES.OUTFIT.NEW);
        }}
      >
        Import item
      </Button>
    </View>
  )
}

export default function Screen() {
  const { hasShareIntent, sourceUrl, imageFiles, resetShareIntent } = useShareIntent();

  const onGoBack = () => {
    resetShareIntent();
    if (router.canGoBack()) router.back();
    else router.dismissTo(ROUTES.TABS.DISCOVER);
  }

  // Safe fallback if opened without intent
  if (!hasShareIntent)
    return (<Redirect href={ROUTES.HOME} />);

  return (
    <View style={{
      padding: 12,
      flex: 1
    }}>
      {sourceUrl && <ExtractItemBrowser onGoBack={onGoBack} />}
      {imageFiles.length > 0 && <ExtractItemFile onGoBack={onGoBack} />}
    </View>
  )
}