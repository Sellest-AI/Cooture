import { useRouter } from "@/hooks";
import { api, useQueryCached } from "@/lib/convex/client";
import { usePhotoshoot } from "@/modules/photoshoot/_hooks/usePhotoshoot";
import { Button } from "@ui/button";
import { Collection } from "@ui/cards";
import { Col, Grid } from "@ui/grid";
import { ArrowRight, Search } from "@ui/icons";
import { MasonryList } from "@ui/masonry-list";
import { AnimatePresence, MotiView } from "@ui/motion";
import { Skeleton } from "@ui/skeleton";
import { TextInput } from "@ui/text-input";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function Screen() {
  const { push } = useRouter('/photoshoot/create');
  const { setPresetId, presetId } = usePhotoshoot.New();
  const { data: presets } = useQueryCached(api.router.presets.getAll.anon);

  const [loaded, setLoaded] = useState(0);
  useFocusEffect(useCallback(() => setLoaded(60), []))

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{
        marginTop: 8,
        paddingHorizontal: 12,
      }}>
        <TextInput
          startIcon={Search}
          placeholder="Search preset"
        />
      </View>
      <MasonryList
        showsVerticalScrollIndicator={false}
        containerStyle={{
          flex: 1,
          paddingHorizontal: 12,
        }}
        contentContainerStyle={{ paddingBottom: presetId !== null ? 72 : 0 }}
        data={(presets ?? []).slice(0, loaded)}
        style={{ columnGap: 36, paddingHorizontal: 12, marginTop: 24 }}
        onEndReachedThreshold={0.2}
        onEndReached={() => setLoaded((p) => p + 30)}
        ListFooterComponent={
          (presets ?? [])?.length > loaded ? <>
            <Grid style={{ gap: 28, height: 3 * (200 + 28) }}>
              <Col style={{ gap: 28 }}>
                <Skeleton style={{ flex: 1 }} />
                <Skeleton style={{ flex: 1 }} />
                <Skeleton style={{ flex: 1 }} />
              </Col>
              <Col style={{ gap: 28 }}>
                <Skeleton style={{ flex: 1 }} />
                <Skeleton style={{ flex: 1 }} />
                <Skeleton style={{ flex: 1 }} />
              </Col>
            </Grid>
          </> : undefined
        }
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
                  if (!selected) requestAnimationFrame(() => push(ROUTES.PHOTOSHOOT.RECAP, { resetNextRoute: false }));
                }}
              />
            </View>
          )
        }}
        numColumns={2}
      />
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
            endIcon={ArrowRight}
            onPress={() => push(ROUTES.PHOTOSHOOT.RECAP, { resetNextRoute: false })}
          >
            Next step
          </Button>
        </MotiView>}
      </AnimatePresence>
    </View>
  )
}