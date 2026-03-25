import { ROUTES, useRoute, useRouter } from "@/hooks";
import { api, Id, useAction, useQuery } from "@/lib/convex/client";
import { Button } from "@ui/button";
import { ImageGeneration } from "@ui/cards";
import { Carousel } from "@ui/screen-carousel";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { atom, useAtom } from "jotai";
import { useState } from "react";
import { View } from "react-native";
import { Colors } from "theme";

const generatingAtom = atom(false);

export default function Screen() {
  const { dismissTo } = useRouter(ROUTES.PRESETS.CREATE.THUMBNAIL);

  const [images, setImages] = useState<string[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);
  const [generating, setGenerating] = useAtom(generatingAtom);

  const { action } = useAction(api.llm.triggers.presetPreview.authed);
  const { action: updatePreset } = useAction(api.router.presets.updateOne.authed);

  const generateThumbnails = async (presetId: Id<'presets'>) => {
    if (generating) return;

    setGenerating(true);
    try {
      const imgs = await action({ presetId, numberOfImages: 3 });
      setImages((prev) => [...prev, ...imgs]);
    } finally {
      setGenerating(false);
    }
  }

  const { presetId } = useRoute(ROUTES.PRESETS.CREATE.THUMBNAIL, {
    onInit: async (params) => {
      if (!params.presetId) {
        if (router.canGoBack()) router.back();
        else router.dismissTo('/');
        return;
      }

      await generateThumbnails(params.presetId);
    }
  });
  const { data: preset } = useQuery(api.router.presets.getOne.anon, { presetId })

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text.H4 style={{
        marginTop: 16,
        marginBottom: 12,
        alignSelf: 'center'
      }}
        weight={500}
        color={Colors.neutral[50]}
      >
        {generating ? 'Generating thumbnails...' : 'Select a thumbnail'}
      </Text.H4>
      <Carousel
        style={{ flex: 1 }}
        itemHeight={408}
        items={(generating ? [1, 2, 3] : images).map((item) => {
          const isLoading = typeof item === 'number';

          if (isLoading) {
            return (
              <ImageGeneration
                key={item}
                source={preset?.cover?.sizes?.medium.url ?? ''}
                loading={isLoading}
                style={{}}
              />
            )
          }

          if (typeof item !== 'string') return null;
          const url = item;

          const isSelected = selectedThumbnail === url;

          return (
            <ImageGeneration
              key={item}
              source={url}
              loading={isLoading}
              onPress={() => setSelectedThumbnail(url)}
              style={{
                borderWidth: isSelected ? 3 : 0,
                borderColor: isSelected ? Colors.primary[500] : undefined,
              }}
            />
          )
        })}
      />
      <View>
        <Button
          variant="primary"
          disabled={!selectedThumbnail}
          onPress={async () => {
            if (!selectedThumbnail) return;

            await updatePreset({
              presetId,
              coverUrl: selectedThumbnail,
              archived: false,
            });

            dismissTo(ROUTES.PHOTOSHOOT.NEW, { params: { presetId } });
          }}
        >
          Publish preset
        </Button>
        <Button
          variant="blur"
          onPress={() => { if (router.canGoBack()) router.back(); }}
          style={{
            marginTop: 8
          }}
        >
          Cancel
        </Button>
      </View>
    </View>
  )
}