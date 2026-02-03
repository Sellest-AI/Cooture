import { useRouter } from "@/hooks";
import { api, useQueryCached } from "@/lib/convex/client";
import { usePhotoshoot } from "@/modules/photoshoot/_hooks/usePhotoshoot";
import { Button } from "@ui/button";
import { Collection } from "@ui/cards";
import { ArrowRight, Search } from "@ui/icons";
import { MasonryList } from "@ui/masonry-list";
import { AnimatePresence, MotiView } from "@ui/motion";
import { TextInput } from "@ui/text-input";
import React from "react";
import { Platform, ScrollView, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function Screen() {
  const { push } = useRouter('/photoshoot/create');
  const { setPresetId, presetId } = usePhotoshoot.New();
  const { data: presets } = useQueryCached(api.router.presets.getAll.anon);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{
        marginTop: 8,
        paddingHorizontal: 12,
        marginBottom: Platform.OS === 'web' ? 0 : 52
      }}>
        <TextInput
          startIcon={Search}
          placeholder="Search preset"
        />
      </View>
      <ScrollView style={{ flex: 1, paddingHorizontal: 12 }}>
        <MasonryList
          data={(presets ?? [])}
          style={{ columnGap: 36, paddingHorizontal: 12, marginTop: 24 }}
          renderItem={({ item, i }) => {
            const selected = presetId === item._id;
            return (
              <View style={{ marginBottom: 24, paddingTop: 3 }}>
                <Collection
                  selected={selected}
                  source={item.cover.sizes.medium.url}
                  contentFit="cover"
                  title={item.name}
                  onPress={() => {
                    setPresetId((p) => p === item._id ? null : item._id);
                    if (!selected) setTimeout(() => push(ROUTES.PHOTOSHOOT.RECAP), 100);
                  }}
                />
              </View>
            )
          }}
          numColumns={2}
        />
        {presetId !== null && <View style={{ height: 86 }} />}
      </ScrollView>
      <AnimatePresence>
        {presetId !== null && <MotiView
          style={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 800 }}
          exit={{ opacity: 0, translateY: 10 }}
          exitTransition={{ duration: 100, delay: 0 }}
        >
          <Button
            style={{ marginTop: 12 }}
            variant="primary"
            href={ROUTES.PHOTOSHOOT.RECAP}
            endIcon={ArrowRight}
          >
            Next step
          </Button>
        </MotiView>}
      </AnimatePresence>
    </View>
  )
}